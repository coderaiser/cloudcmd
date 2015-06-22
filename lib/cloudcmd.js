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
        validate    = require(DIR_SERVER + 'validate'),
        createPass  = require(DIR_SERVER + 'password'),
        
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
        var p               = params || {},
            options         = p.config || {},
            prefix          = p.prefix || '',
            keys            = Object.keys(options);
        
        keys.forEach(function(name) {
            var value = options[name];
            
            switch(name) {
            case 'root':
                validate.root(value);
                break;
            case 'editor':
                validate.editor(value);
                break;
            case 'password':
                value = createPass(config('algo'), value);
                break;
            }
            
            config(name, value);
        });
        
        if (p.socket)
            listen(p.socket);
        
        return cloudcmd(prefix);
    };
    
    function listen(socket) {
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
    }
    
    function cloudcmd(prefix) {
        var isOption    = function(name) {
                return config(name);
            },
            
            isMinify    = isOption.bind(null, 'minify'),
            isOnline    = isOption.bind(null, 'online'),
            isCache     = isOption.bind(null, 'cache'),
            isDiff      = isOption.bind(null, 'diff'),
            isZip       = isOption.bind(null, 'zip'),
            
            ponseStatic = ponse.static(DIR_ROOT, {
                cache: isCache
            }),
            
            funcs       = [
                logout,
                setUrl(prefix),
                auth(),
                config(),
                restafary({
                    prefix  : cloudfunc.apiURL + '/fs',
                    root    : root
                }),
                rest,
                route({
                    prefix: prefix
                }),
                
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
    
    function logout(req, res, next) {
        if (req.url === '/logout')
            res.sendStatus(401);
        else
            next();
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
})();
