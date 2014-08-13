/* RESTful module */

(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# rest.js'                                        + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with REST API.'                   + '\n'  +
             '# If you wont to see at work set rest: true'      + '\n'  +
             '# and apiURL in config.json'                      + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        path        = main.path,
        crypto      = main.crypto,
        Util        = main.util,
        pipe        = main.pipe,
        CloudFunc   = main.cloudfunc,
        
        onFSGet     = main.srvrequire('rest/fs/get').onGet,
        onFSPut     = main.srvrequire('rest/fs/put').onPut,
        onDelete    = main.srvrequire('rest/fs/delete').onDelete,
        markdown    = main.srvrequire('rest/markdown'),
        
        JSONDIR     = main.JSONDIR,
        
        DIR         = './',
        
        flop        = require(DIR + 'flop'),
        pack        = require(DIR + 'pack'),
        mellow      = require(DIR + 'mellow'),
        format      = require(DIR + 'format'),
        isWin32     = process.platform === 'win32';
        
        
    /**
     * rest interface
     *
     * @param request
     * @param response
     * @param callback
     */
    exports.api = function(request, response, callback) {
        var apiURL, name, ret,
            params  = {
                request     : request,
                response    : response,
            };
        
        if (request && response) {
            apiURL  = CloudFunc.apiURL;
            name    = main.getPathName(request);
            ret     = Util.isContainStr(name, apiURL);
            
            if (ret) {
                params.name = Util.rmStrOnce(name, apiURL) || '/';
                
                sendData(params, function(error, options, data) {
                    params.gzip = !error;
                    
                    if (!data) {
                        data    = options;
                        options = {};
                    }
                    
                    if (options.name)
                        params.name = options.name;
                    
                    if (options.query)
                        params.query = options.query;
                    
                    if (error)
                        main.sendError(error, params);
                    else
                        main.sendResponse(params, data, options.notLog);
                });
            }
        }
        if (!ret && callback)
            callback();
        
        return ret;
    };
    
    /**
     * getting data on method and command
     * 
     * @param params {command, method, body, requrest, response}
     */
    function sendData(params, callback) {
        var p, isFS, isMD,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            isFS    = Util.isContainStrAtBegin(p.name, CloudFunc.FS),
            isMD    = Util.isContainStrAtBegin(p.name, '/markdown');
            
            if (isFS)
                onFS(params, callback);
            else if (isMD)
                markdown.operate(p.name, p.request, function(error, data) {
                    callback(error, {notLog: true}, data);
                });
            else {
                if (p.name[0] === '/')
                    p.command = Util.rmStrOnce(p.name, '/');
                
                switch(p.request.method) {
                case 'GET':
                    ret = onGET(params, callback);
                    break;
                    
                case 'PUT':
                    pipe.getBody(p.request, function(error, body) {
                        if (error) {
                            callback(error);
                        } else {
                            p.body = body;
                            onPUT(params, callback);
                        }
                    });
                    break;
                }
            }
        }
        return ret;
    }
    
    function onFS(params, callback) {
        var p, query, path,
            ret     = main.checkParams(params);
        
        if (ret) {
            p       = params;
            query   = main.getQuery(p.request);
            p.name  = Util.rmStrOnce(p.name, CloudFunc.FS) || '/';
            path    = mellow.convertPath(p.name);
            
            switch (p.request.method) {
            case 'GET':
                onFSGet(query, path, function(error, data) {
                    var str, 
                        options = {},
                        isFile  = error && error.code === 'ENOTDIR',
                        isStr   = Util.isString(data),
                        params  = {
                            gzip: true,
                            name: path,
                            request: p.request,
                            response: p.response,
                        };
                    
                    if (isFile) {
                        main.sendFile(params);
                    } else {
                        if (!error) {
                            data.path   = format.addSlashToEnd(p.name);
                            options.name += '.json';
                            options.query = query;
                            
                            if (isStr)
                                str = data;
                            else
                                str = Util.stringifyJSON(data);
                        }
                        
                        callback(error, options, str);
                    }
                });
            
            break;
                
            case 'PUT':
                onFSPut(query, path, p.request, callback);
                break;
                
            case 'DELETE':
                pipe.getBody(p.request, function(error, body) {
                    var files;
                    
                    if (error)
                        callback(error);
                    else {
                        files   = Util.parseJSON(body);
                        
                        onDelete(query, path, files, function(error) {
                            var names, msg;
                            
                            if (!error) {
                                if (files && files.length)
                                    names = files;
                                else
                                    names = p.name;
                                
                                msg = formatMsg('delete', names);
                            }
                            
                            callback(error, msg);
                        });
                    }
                });
                break;
            }
        }
        
        return ret;
    }
    
    /**
     * process data on GET request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onGET(params, callback) {
        var p, cmd, json, ret = main.checkParams(params);
        if (ret) {
            p   = params,
            cmd = p.command;
            
            switch(cmd) {
            case '':
                p.data = Util.stringifyJSON({
                    info: 'Cloud Commander API v1'
                });
                
                callback(null, {name: 'api.json'}, p.data);
                break;
            
            case 'config':
                main.sendFile({
                    name    : JSONDIR + 'config.json',
                    request : p.request,
                    response: p.response,
                    cache   : false
                });
                break;
            
            default:
                json = {
                    message: 'Error: command not found!'
                };
                
                callback(json);
                break;
            }
        }
        
        return ret;
    }
    
    /**
     * process data on PUT request
     * 
     * @param pParams {command, method, body, requrest, response}
     */
    function onPUT(params, callback) {
        var p, cmd, files, name, json, config, data, from, to, error,
            ret             = main.checkParams(params, ['body']);
        
        if (ret) {
            p       = params,
            cmd     = p.command,
            files   = Util.parseJSON(p.body);
            
            switch(cmd) {
            case 'auth':
                main.auth(p.body, function(error, token) {
                    callback(error, Util.stringifyJSON({
                        data: token
                    }));
                });
                break;
            
            case 'mv':
                if (!files.from || !files.to) {
                    callback(p.data);
                
                } else if (isRootWin32(files.to)) {
                    error = getWin32RootMsg('to');
                    callback(error);
                
                } else if (isRootWin32(files.from)) {
                    error = getWin32RootMsg('from');
                    callback(error);
                
                } else {
                    files.from  = mellow.convertPath(files.from);
                    files.to    = mellow.convertPath(files.to);
                    
                    if (files.names)
                        data    = Util.slice(files.names);
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
                    callback(p.data);
                
                } else if (isRootWin32(files.to)) {
                    error = getWin32RootMsg('to');
                    callback(error);
                
                } else if (isRootWin32(files.from)) {
                    error = getWin32RootMsg('from');
                    callback(error);
                } else {
                    files.from  = mellow.convertPath(files.from);
                    files.to    = mellow.convertPath(files.to);
                    
                    files.namesAll    = Util.slice(files.names);
                    copyFiles(files, flop.copy, function(error) {
                        var msg = formatMsg('copy', files.namesAll);
                        
                        callback(error, msg);
                    });
                }
                break;
            
            case 'zip':
                if (!files.from) {
                    callback(p.data);
                } else {
                    from    = mellow.convertPath(files.from);
                    
                    if (files.to)
                        to  = mellow.convertPath(files.to);
                    else
                        to  = from + '.zip';
                    
                    pack.gzip(from, to, function(error) {
                        var name    = path.basename(files.from),
                            msg     = formatMsg('zip', name);
                        
                        callback(error, msg);
                    });
            }
                break;
            
            case 'unzip':
                if (!files.from) {
                    callback(p.data);
                } else {
                    from        = mellow.convertPath(files.from);
                    
                    if (files.to)
                        to      = mellow.convertPath(files.to);
                    else
                        to      = Util.rmStrOnce(files.from, ['.zip', '.gzip']);
                    
                  pack.gunzip(from, to, function(error) {
                        var name    = path.basename(files.from),
                            data    = formatMsg('unzip', name);
                        
                        callback(error, data);
                    });
                }
                    
                break;
            
            case 'config':
                var passwd  = files && files.password,
                    sha     = crypto.createHash('sha1');
                    config  = main.config;
                
                if (passwd) {
                    sha.update(passwd);
                    passwd          = sha.digest('hex');
                    files.password = passwd;
                }
                
                for (name in files)
                    config[name] = files[name];
                
                json = Util.stringifyJSON(config) + '\n';
                
                fs.writeFile(JSONDIR + 'config.json', json, function(error) {
                    data = formatMsg('config', name);
                    callback(error, data);
                });
                
                break;
            
            default:
                callback();
                break;
            }
        }
        
        return ret;
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
        
        Util.checkArgs(arguments, ['files', 'processFunc', 'callback']);
        
        copy();
    }
    
    function isRootWin32(path) {
        var isRoot      = path === '/';
        
        return isWin32 && isRoot; 
    }
    
    function getWin32RootMsg(direction) {
        var messageRaw  = 'Could not copy {{ direction }} root on windows!',
            message     = Util.render(messageRaw, {
                direction: direction
            }),
            error       = Error(message);
        
        return error;
    }
    
    function formatMsg(msgParam, dataParam, status) {
        var msg, data,
            isObj = Util.isObject(dataParam);
        
        if (isObj)
            data = Util.stringifyJSON(dataParam);
        else
            data = dataParam;
            
        msg = CloudFunc.formatMsg(msgParam, data, status);
        
        return msg;
    }
    
})();
