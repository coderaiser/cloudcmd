'use strict';

var DIR         = './',
    DIR_LIB     = DIR + '../',
    
    path        = require('path'),
    root        = require(DIR + 'root'),
    config      = require(DIR + 'config'),
    
    CloudFunc   = require(DIR_LIB + 'cloudfunc'),
    
    markdown    = require(DIR + 'markdown'),
    
    jaguar      = require('jaguar/legacy'),
    onezip      = require('onezip/legacy'),
    
    flop        = require('flop'),
    pullout     = require('pullout/legacy'),
    ponse       = require('ponse'),
    rendy       = require('rendy'),
    copymitter  = require('copymitter'),
    json        = require('jonny'),
    check       = require('checkup'),
    
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
    
    check
        .type('next', next, 'function')
        .check({
            request: request,
            response: response
        });
    
    apiURL  = CloudFunc.apiURL;
    name    = ponse.getPathName(request);
    regExp  = RegExp('^' + apiURL);
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
            pullout(p.request, 'string', function(error, body) {
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
    var cmd, p = params;
    
    if (p.name[0] === '/')
        cmd = p.name.replace('/', '');
    
    if (/^pack/.test(cmd)) {
        cmd = cmd.replace(/^pack/, '');
        streamPack(root(cmd), p.response);
    } else {
        switch(cmd) {
        case '':
            p.data = json.stringify({
                info: 'Cloud Commander API v1'
            });
            
            callback(null, {name: 'api.json'}, p.data);
            break;
        
        default:
            callback({
                message: 'Not Found'
            });
            break;
        }
    }
}

function getPackReg() {
    if (config('zip') === 'zip')
        return /\.zip$/;
    
    return /\.tar\.gz$/;
}

function streamPack(cmd, response) {
    var noop = function() {};
    var filename = cmd.replace(getPackReg(), '');
    var dir = path.dirname(filename);
    var names = [
        path.basename(filename)
    ];
    
    operation('pack', dir, response, names, noop);
}

/**
 * process data on PUT request
 *
 * @param pParams {command, method, body, requrest, response}
 */
function onPUT(name, body, callback) {
    var cmd, files, data, msg;
    
    check
        .type('callback', callback, 'function')
        .check({
            name: name,
            body: body
        });
    
    if (name[0] === '/')
        cmd = name.replace('/', '');
    
    files   = json.parse(body);
    
    switch(cmd) {
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
        if (!files.from)
            callback(body);
        else
            pack(files.from, files.to, files.names, callback);
        break;
    
    case 'extract':
        if (!files.from)
            callback(body);
        else
            extract(files.from, files.to, callback);
            
        break;
    
    default:
        callback();
        break;
    }
}

function pack(from, to, names, fn) {
    from    = root(from);
    to      = root(to);
    
    if (!names) {
        names = [
            path.basename(from)
        ];
        
        from = path.dirname(from);
    }
    
    operation('pack', from, to, names, fn);
}

function extract(from, to, fn) {
    from    = root(from);
            
    if (to)
        to  = root(to);
    else
        to = from.replace(/\.tar\.gz$/, '');
    
    operation('extract', from, to, fn);
}

function getPacker() {
    if (config('packer') === 'zip')
        return onezip;
    
    return jaguar;
}

function operation(op, from, to, names, fn) {
    if (!fn) {
        fn      = names;
        names   = [
            path.basename(from)
        ];
    }
    
    var packer = getPacker()[op](from, to, names);
    
    packer.on('error', function(error) {
        fn(error);
    });
    
    packer.on('progress', function(count) {
        process.stdout.write(rendy('\r{{ operation }} "{{ name }}": {{ count }}%', {
            operation   : op,
            name        : names[0],
            count       : count
        }));
    });
    
    packer.on('end', function() {
        process.stdout.write('\n');
        
        var name = path.basename(from);
        var msg = formatMsg(op, name);
        
        fn(null, msg);
    });
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
                isLast  = !names.length;
                name    = names.shift();
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
    
    check
        .type('callback', callback, 'function')
        .type('processFunc', processFunc, 'function')
        .check({
            files: files
        });
    
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

