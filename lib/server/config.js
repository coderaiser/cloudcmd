(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        DIR         = DIR_SERVER    + '../../',
        
        HOME_WIN    = process.env.HOMEPATH,
        HOME_UNIX   = process.env.HOME,
        
        HOME        = (HOME_UNIX || HOME_WIN) + '/',
        
        fs          = require('fs'),
        crypto      = require('crypto'),
        
        Util        = require(DIR_LIB       + 'util'),
        CloudFunc   = require(DIR_LIB       + 'cloudfunc'),
        
        ponse       = require(DIR_SERVER    + 'ponse'),
        pipe        = require(DIR_SERVER    + 'pipe'),
        tryRequire  = require(DIR_SERVER    + 'tryRequire'),
        
        apiURL      = CloudFunc.apiURL,
        
        ConfigPath  = DIR   + 'json/config.json',
        ConfigHome  = HOME  + '.cloudcmd.json',
        
        config      =
            tryRequire(ConfigHome) ||
            tryRequire(ConfigPath, {log: true}) || {};
    
    module.exports          = set;
    module.exports.save     = save;
    
    function set(key, value) {
        var result;
        
        if (key)
            if (value === undefined)
                result      = config[key];
            else
                config[key] = value;
        else
            result          = middle;        
        
        return result;
    }
    
    function save(callback) {
        var data = Util.json.stringify(config);
        
        Util.check(arguments, ['callback']);
        
        if (data)
            fs.writeFile(ConfigHome, data, callback);
        else
            callback({
                message: 'Error: config is empty!'
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
        var data = Util.json.stringify(config);
        
        ponse.send(data, {
            name    : 'config.json',
            request : req,
            response: res,
            cache   : false
        }, true);
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
                json    = Util.json.parse(body) || {},
                passwd  = json.passwd,
                sha     = crypto.createHash('sha1');
            
            if (error) {
                callback(error);
            } else if (json.passwd) {
                sha.update(passwd);
                passwd          = sha.digest('hex');
                json.password   = passwd;
            }
            
            Object.keys(json).forEach(function(name) {
                data = CloudFunc.formatMsg('config', name);
                set(name, json[name]);
            });
            
            save(function(error) {
                if (error)
                    ponse.sendError(error, options);
                else
                    ponse.send(data, options);
            });
        });
    }
    
})();
