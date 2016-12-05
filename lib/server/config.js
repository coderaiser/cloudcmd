'use strict';

var DIR_SERVER  = __dirname     + '/',
    DIR_LIB     = DIR_SERVER    + '../',
    DIR         = DIR_SERVER    + '../../',
    
    path        = require('path'),
    
    exit        = require(DIR_SERVER    + 'exit'),
    CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
    
    pullout     = require('pullout/legacy'),
    ponse       = require('ponse'),
    jonny       = require('jonny'),
    readjson    = require('readjson'),
    writejson   = require('writejson'),
    tryCatch    = require('try-catch'),
    exec        = require('execon'),
    criton      = require('criton'),
    
    HOME        = require('os-homedir')(),
    
    apiURL      = CloudFunc.apiURL,
    
    ConfigPath  = path.join(DIR, 'json/config.json'),
    ConfigHome  = path.join(HOME, '.cloudcmd.json'),
    
    error,
    config;
    
    error = tryCatch(function() {
        config = readjson.sync(ConfigHome);
    });
    
    if (error) {
        if (error.code !== 'ENOENT')
            console.error('cloudcmd --config ~/.cloudcmd.json:', error.message);
        
        error = tryCatch(function() {
            config = readjson.sync(ConfigPath);
        });
        
        if (error)
            exit('cloudcmd --config', ConfigPath + ':', error.message);
    }

module.exports          = manage;
module.exports.save     = save;
module.exports.middle   = middle;
module.exports.listen   = function(socket, authCheck) {
    check(socket, authCheck);
    
    if (!manage('configDialog'))
        return middle;
    
    listen(socket, authCheck);
    
    return middle;
};

function manage(key, value) {
    if (!key)
        return;
        
    if (value === undefined)
        return config[key];
    
    config[key] = value;
}

function save(callback) {
    writejson(ConfigHome, config, callback);
}

function listen(sock, authCheck) {
    var prefix = manage('prefix');
    
    sock.of(prefix + '/config')
        .on('connection', function(socket) {
            var connect = exec.with(connection, socket);
            
            exec.if(!manage('auth'), connect, function(fn) {
                authCheck(socket, fn);
            });
        });
}

function connection(socket) {
    socket.emit('config', config);
    
    socket.on('message', function(json) {
        var data;
        
        if (typeof json !== 'object') {
            socket.emit('err', 'Error: Wrong data type!');
        } else {
            cryptoPass(json);
            
            data = traverse(json);
            
            save(function(error) {
                if (error) {
                    socket.emit('err', error.message);
                } else {
                    socket.broadcast.send(json);
                    socket.send(json);
                    socket.emit('log', data);
                }
            });
        }
    });
}

function middle(req, res, next) {
    var noConfigDialog = !manage('configDialog');
    
    if (req.url !== apiURL + '/config') {
        next();
    } else {
        switch(req.method) {
        case 'GET':
            get(req, res, next);
            break;
        
        case 'PATCH':
            if (noConfigDialog)
                return res
                    .status(404)
                    .send('Config is disabled');
             
            patch(req, res, next);
            break;
        
        default:
            next();
        }
    }
}

function get(req, res) {
    var data = jonny.stringify(config);
    
    ponse.send(data, {
        name    : 'config.json',
        request : req,
        response: res,
        cache   : false
    });
}

function patch(req, res, callback) {
    var options = {
        name    : 'config.json',
        request : req,
        response: res,
        cache   : false
    };
    
    pullout(req, 'string', function(error, body) {
        var json = jonny.parse(body) || {};
        
        if (error)
            return callback(error);
             
        cryptoPass(json);
        
        save(function(error) {
            if (error)
                return ponse.sendError(error, options);
            
            var data = traverse(json);
            
            ponse.send(data, options);
        });
    });
}

function traverse(json) {
    var data;
    
    Object.keys(json).forEach(function(name) {
        data = CloudFunc.formatMsg('config', name);
        manage(name, json[name]);
    });
    
    return data;
}

function cryptoPass(json) {
    var algo = manage('algo');
    
    if (json && json.password)
        json.password = criton(json.password, algo);
}

function check(socket, authCheck) {
    if (!socket)
        throw Error('socket could not be empty!');
    
    if (authCheck && typeof authCheck !== 'function')
        throw Error('authCheck should be function!');
}

