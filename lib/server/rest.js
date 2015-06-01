(function() {
    'use strict';
    
    /*
     '# rest.js'                                        + '\n'  +
     '# -----------'                                    + '\n'  +
     '# Module is part of Cloud Commander,'             + '\n'  +
     '# used for work with REST API.'                   + '\n'  +
     '# http://cloudcmd.io'                             + '\n');
    */
    
    var DIR         = './',
        DIR_LIB     = DIR + '../',
        DIR_JSON    = DIR_LIB + '../json/',
        
        path        = require('path'),
        root        = require(DIR + 'root'),
        config      = require(DIR + 'config'),
        binom       = require(DIR + 'binom'),
        
        CloudFunc   = require(DIR_LIB + 'cloudfunc'),
        
        markdown    = require(DIR + 'rest/markdown'),
        
        github      = require('faust'),
        packer      = require('jag'),
        
        flop        = require('flop'),
        pipe        = require('pipe-io'),
        ponse       = require('ponse'),
        rendy       = require('rendy'),
        copymitter  = require('copymitter'),
        json        = require('jonny'),
        check       = require('checkup'),
        
        Modules     = require(DIR_JSON + 'modules'),
        
        isWin32     = process.platform === 'win32';
        
    /**
     * rest interface
     *
     * @param request
     * @param response
     * @param callback
     */
    module.exports = function(request, response, next) {
        var apiURL, name, is, regExp,
            params  = {
                request     : request,
                response    : response
            };
        
        check(arguments, ['request', 'response', 'next']);
        
        apiURL  = CloudFunc.apiURL;
        name    = ponse.getPathName(request);
        regExp  = new RegExp('^' + apiURL),
        is      = regExp.test(name);
        
        if (!is) {
            next();
        } else {
            params.name = name.replace(apiURL, '') || '/';
            
            sendData(params, function(error, options, data) {
                params.gzip = !error;
                
                if (!data) {
                    data    = options;
                    options = {};
                }
                
                if (options.name)
                    params.name = options.name;
                
                if (options.gzip !== undefined)
                    params.gzip = options.gzip;
                
                if (options.query)
                    params.query = options.query;
                
                if (error)
                    ponse.sendError(error, params);
                else
                    ponse.send(data, params);
            });
        }
    };
    
    /**
     * getting data on method and command
     *
     * @param params {name, method, body, requrest, response}
     */
    function sendData(params, callback) {
        var p       = params,
            isMD    = RegExp('^/markdown').test(p.name);
        
        if (isMD)
            markdown(p.name, p.request, function(error, data) {
                callback(error, data);
            });
        else
            switch(p.request.method) {
            case 'GET':
                onGET(params, callback);
                break;
                
            case 'PUT':
                pipe.getBody(p.request, function(error, body) {
                    if (error)
                        callback(error);
                    else
                        onPUT(p.name, body, callback);
                });
                break;
            }
    }
    
    /**
     * process data on GET request
     *
     * @param pParams {method, body, requrest, response}
     */
    function onGET(params, callback) {
        var cmd, json,
            p = params;
        
        if (p.name[0] === '/')
            cmd = p.name.replace('/', '');
        
        switch(cmd) {
        case '':
            p.data = json.stringify({
                info: 'Cloud Commander API v1'
            });
            
            callback(null, {name: 'api.json'}, p.data);
            break;
        
        default:
            json = {
                message: 'Error: command not found!'
            };
            
            callback(json);
            break;
        }
    }
    
    function auth(code, callback) {
        var storage = binom('storage', Modules),
            gh      = binom('GitHub', storage),
            env     = process.env,
            
            key     = env.github_key || gh.key,
            secret  = env.github_secret || gh.secret,
            
            ghAuth  = github(key, secret);
        
        ghAuth(code, callback);
    }
    
    /**
     * process data on PUT request
     *
     * @param pParams {command, method, body, requrest, response}
     */
    function onPUT(name, body, callback) {
        var cmd, files, data, from, to, msg;
        
        check(arguments, ['name', 'body', 'callback']);
        
        if (name[0] === '/')
            cmd = name.replace('/', '');
        
        files   = json.parse(body);
        
        switch(cmd) {
        case 'auth':
            auth(body, function(error, token) {
                callback(error, json.stringify({
                    data: token
                }));
            });
            break;
        
        case 'mv':
            if (!files.from || !files.to) {
                callback(body);
            } else if (isRootAll([files.to, files.from])) {
                callback(getWin32RootMsg());
            } else {
                files.from  = root(files.from);
                files.to    = root(files.to);
                
                if (files.names)
                    data    = files.names.slice();
                else
                    data    = files;
                    
                copyFiles(files, flop.move, function(error) {
                    var msg = formatMsg('move', data);
                    
                    callback(error, msg);
                });
            }
            
            break;
        
        case 'cp':
            if (!files.from || !files.names || !files.to) {
                callback(body);
            } else if (isRootAll([files.to, files.from])) {
                callback(getWin32RootMsg());
            } else {
                files.from  = root(files.from);
                files.to    = root(files.to);
                
                msg         = formatMsg('copy', files.names);
                
                copy(files.from, files.to, files.names, function(error) {
                    callback(error, msg);
                });
            }
            break;
        
        case 'pack':
            if (!files.from) {
                callback(body);
            } else {
                from    = root(files.from);
                
                if (files.to)
                    to  = root(files.to);
                else
                    to  = from + '.gz';
                
                packer.pack(from, to, function(error) {
                    var name    = path.basename(files.from),
                        msg     = formatMsg('pack', name);
                    
                    callback(error, msg);
                });
            }
            break;
        
        case 'unpack':
            if (!files.from) {
                callback(body);
            } else {
                from    = root(files.from);
                
                if (files.to)
                    to  = root(files.to);
                else
                    to = files.from.replace(/(\.gz|\.tar\.gz)$/, '');
                
              packer.unpack(from, to, function(error) {
                    var name    = path.basename(files.from),
                        data    = formatMsg('unpack', name);
                    
                    callback(error, data);
                });
            }
                
            break;
        
        default:
            callback();
            break;
        }
    }
    
    function copy(from, to, names, fn) {
        var error,
            tmpl    = '\r copy {{ from }} {{ to }} {{ count }}%',
            cp      = copymitter(from, to, names);
         
        cp.on('error', function(e) {
            error = e;
            cp.abort();
        });
        
        cp.on('progress', function(count) {
            process.stdout.write(rendy(tmpl, {
                to: to,
                from: from,
                count: count
            }));
        });
        
        cp.on('end', function() {
            process.stdout.write('\n');
            fn(error);
        });
    }
    
    function copyFiles(files, processFunc, callback) {
        var names           = files.names,
            
            copy            = function() {
                var isLast, name,
                    from    = files.from,
                    to      = files.to;
                
                if (names) {
                    isLast  = !names.length,
                    name    = names.shift(),
                    from    += name;
                    to      += name;
                } else {
                    isLast  = false;
                    names   = [];
                }
                
                if (isLast)
                    callback();
                else
                    processFunc(from, to, function(error) {
                        if (error)
                            callback(error);
                        else
                            copy();
                    });
            };
        
        check(arguments, ['files', 'processFunc', 'callback']);
        
        copy();
    }
    
    function isRootWin32(path) {
        var isRoot      = path === '/',
            isConfig    = config('root') === '/';
        
        return isWin32 && isRoot && isConfig;
    }
    
    function isRootAll(names) {
        var is = names.some(function(name) {
            return isRootWin32(name);
        });
        
        return is;
    }
    
    function getWin32RootMsg() {
        var message     = 'Could not copy from/to root on windows!',
            error       = Error(message);
        
        return error;
    }
    
    function formatMsg(msgParam, dataParam, status) {
        var msg, data,
            isObj = typeof dataParam === 'object';
        
        if (isObj)
            data = json.stringify(dataParam);
        else
            data = dataParam;
            
        msg = CloudFunc.formatMsg(msgParam, data, status);
        
        return msg;
    }
    
})();
