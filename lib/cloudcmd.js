(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_ROOT    = DIR + '../',
        DIR_SERVER  = DIR + 'server/',
        
        Util        = require(DIR + 'util'),
        cloudfunc   = require(DIR + 'cloudfunc'),
        
        auth        = require(DIR_SERVER + 'auth'),
        config      = require(DIR_SERVER + 'config'),
        rest        = require(DIR_SERVER + 'rest'),
        route       = require(DIR_SERVER + 'route'),
        
        join        = require('join-io'),
        ponse       = require('ponse'),
        mollify     = require('mollify'),
        restafary   = require('restafary'),
        webconsole  = require('console-io'),
        edward      = require('edward'),
        dword       = require('dword'),
        spero       = require('spero'),
        
        root        = function() {
            return config('root');
        },
        
        emptyFunc   = function(req, res, next) {
            next();
        };
        
        emptyFunc.middle    = function() {
            return emptyFunc;
        },
        
    module.exports = function(params) {
        var keys,
            p               = params || {},
            prefix          = p.prefix || '/cloudcmd';
        
        if (params) {
            keys = Object.keys(params);
            
            keys.forEach(function(name) {
                config(name, params[name]);
            });
        }
        
        return cloudcmd(prefix);
    };
    
    module.exports.middle    = function(params) {
        var p               = params || {},
            prefix          = p.prefix || '/cloudcmd',
            funcs           = cloudcmd(),
            middle          = respond.bind(null, prefix, funcs);
        
        return middle;
    };
    
    module.exports.listen   = function(socket) {
        var size = cloudfunc.MAX_SIZE;
        
        Util.check(arguments, ['socket']);
        
        webconsole({
            socket: socket
        });
        
        config.socket(socket);
        
        edward.listen(socket, {
            size: size,
            root: root
        });
        
        dword.listen(socket, {
            size: size,
            root: root
        });
        
        spero.listen(socket, {
            root: root
        });
    };
    
    function cloudcmd(prefix) {
        var isOption    = function(name) {
                return config(name);
            },
            
            isMinify    = isOption.bind(null, 'minify'),
            isOnline    = isOption.bind(null, 'online'),
            isCache     = isOption.bind(null, 'cache'),
            isDiff      = isOption.bind(null, 'diff'),
            isZip       = isOption.bind(null, 'zip'),
            
            authFunc    = config('auth') ? auth() : emptyFunc,
            
            ponseStatic = ponse.static(DIR_ROOT, {
                cache: isCache
            }),
            
            funcs       = [
                setUrl(prefix),
                authFunc,
                config(),
                restafary({
                    prefix  : cloudfunc.apiURL + '/fs',
                    root    : root
                }),
                rest,
                route,
                
                join({
                    dir     : DIR_ROOT,
                    minify  : isMinify
                }),
                
                webconsole.middle({
                    minify: isMinify,
                    online: isOnline
                }),
                
                edward({
                    minify  : isMinify,
                    online  : isOnline,
                    diff    : isDiff,
                    zip     : isZip
                }),
               
                dword({
                    minify  : isMinify,
                    online  : isOnline,
                    diff    : isDiff,
                    zip     : isZip
                }),
                
                spero({
                    minify: isMinify,
                    online: isOnline
                }),
                
                mollify({
                    dir : DIR_ROOT,
                    is  : isMinify
                }),
                
                ponseStatic
            ];
        
        return funcs;
    }
    
    function setUrl(prefix) {
        return function(req, res, next) {
            var is      = !req.url.indexOf(prefix);
            
            if (is) {
                req.url = req.url.replace(prefix, '') || '/';
                
                if (req.url === '/cloudcmd.js')
                    req.url = '/lib/client/cloudcmd.js';
            }
            
            next();
        };
    }
    
    function respond(prefix, funcs, req, res) {
        funcs = funcs.map(function(func) {
            return Util.exec.with(func, req, res);
        });
        
        Util.exec.series(funcs);
    }
})();
