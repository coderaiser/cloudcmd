(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        DIR         = DIR_SERVER    + '../../',
        
        fs          = require('fs'),
        os          = require('os'),
        
        password    = require(DIR_SERVER    + 'password'),
        Util        = require(DIR_LIB       + 'util'),
        CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
        
        check       = require('checkup'),
        pipe        = require('pipe-io'),
        ponse       = require('ponse'),
        jonny       = require('jonny'),
        tryRequire  = require('tryrequire'),
        
        apiURL      = CloudFunc.apiURL,
        
        ConfigPath  = DIR   + 'json/config.json',
        ConfigHome  = homedir()  + '.cloudcmd.json',
        
        config      =
            tryRequire(ConfigHome) ||
            tryRequire(ConfigPath);
        
    module.exports          = manage;
    module.exports.save     = save;
    module.exports.middle   = function(options) {
        var o = options || {};
        
        if (o.socket)
            socket(o.socket);
        
        return middle;
    };
    
    function homedir() {
        var fn = os.homedir || function() {
            var HOME_WIN    = process.env.HOMEPATH,
                HOME_UNIX   = process.env.HOME,
                HOME        = (HOME_UNIX || HOME_WIN);
            
            return HOME;
        };
        
        return fn() + '/';
    }
    
    function manage(key, value) {
        var result;
        
        if (key)
            if (value === undefined)
                result      = config[key];
            else
                config[key] = value;
        
        return result;
    }
    
    function save(callback) {
        var data = jonny.stringify(config, 0, 4);
        
        check([callback], ['callback']);
        
        if (data)
            fs.writeFile(ConfigHome, data, callback);
        else
            callback(Error('Config is empty!'));
    }
    
    function socket(sock) {
        check([sock], ['socket']);
        
        sock.of('/config')
            .on('connection', function(socket) {
                socket.emit('config', config);
                
                socket.on('message', function(json) {
                    var data,
                        is = Util.type.object(json);
                    
                    if (!is) {
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
            });
    }
    
    function middle(req, res, next) {
        if (req.url !== apiURL + '/config') {
            next();
        } else {
            switch(req.method) {
            case 'GET':
                get(req, res, next);
                break;
            
            case 'PATCH':
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
        
        pipe.getBody(req, function(error, body) {
            var data    = '',
                json    = jonny.parse(body) || {};
            
            if (error)
                callback(error);
            else
                cryptoPass(json);
            
            data = traverse(json);
            
            save(function(error) {
                if (error)
                    ponse.sendError(error, options);
                else
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
            json.password = password(algo, json.password);
    }
    
})();
