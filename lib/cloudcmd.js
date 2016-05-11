(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_ROOT    = DIR + '../',
        DIR_SERVER  = DIR + 'server/',
        
        cloudfunc   = require(DIR + 'cloudfunc'),
        
        auth        = require(DIR_SERVER + 'auth'),
        config      = require(DIR_SERVER + 'config'),
        rest        = require(DIR_SERVER + 'rest'),
        route       = require(DIR_SERVER + 'route'),
        validate    = require(DIR_SERVER + 'validate'),
        prefixer    = require(DIR_SERVER + 'prefixer'),
        
        apart       = require('apart'),
        join        = require('join-io'),
        ponse       = require('ponse'),
        mollify     = require('mollify'),
        restafary   = require('restafary'),
        webconsole  = require('console-io'),
        edward      = require('edward'),
        dword       = require('dword'),
        spero       = require('spero'),
        remedy      = require('remedy'),
        ishtar      = require('ishtar'),
        criton      = require('criton'),
        
        root        = function() {
            return config('root');
        },
        
        emptyFunc   = function(req, res, next) {
            next();
        };
        
        emptyFunc.middle    = function() {
            return emptyFunc;
        };
    
    function getPrefix(prefix) {
        var result;
        
        if (typeof prefix === 'function')
            result = prefix();
        else
            result = prefix;
        
        return result || '';
    }
    
    module.exports = function(params) {
        var prefix,
            p               = params || {},
            options         = p.config || {},
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
                /* could be useful when used as middleware */
                value = criton(value, config('algo'));
                break;
            case 'prefix':
                prefix = prefixer(value);
                break;
            }
            
            config(name, value);
        });
        
        if (p.socket)
            listen(prefix, p.socket);
        
        return cloudcmd(prefix);
    };
    
    function authCheck(socket, success) {
        if (!config('auth'))
            return success();
        
        socket.on('auth', function(name, pass) {
            name === config('username') &&
            pass === config('password') ?
            
            success() : socket.emit('auth');
        });
    }
    
    function listen(prefix, socket) {
        var size = cloudfunc.MAX_SIZE;
        
        prefix = getPrefix(prefix);
        
        config.listen(socket, authCheck);
        
        webconsole({
            prefix: prefix + '/console',
            socket: socket,
            authCheck: authCheck
        });
        
        edward.listen(socket, {
            size: size,
            root: root,
            prefix: prefix + '/edward'
        });
        
        dword.listen(socket, {
            size: size,
            root: root,
            prefix: prefix + '/dword'
        });
        
        spero.listen(socket, {
            root: root,
            prefix: prefix + '/spero'
        });
        
        remedy.listen(socket, {
            root: root,
            prefix: prefix + '/remedy'
        });
        
        ishtar.listen(socket, {
            root: root,
            prefix: prefix + '/ishtar'
        });
    }
    
    function cloudcmd(prefix) {
        var isOption    = function(name) {
                return config(name);
            },
            
            isMinify    = apart(isOption, 'minify'),
            isOnline    = apart(isOption, 'online'),
            isCache     = apart(isOption, 'cache'),
            isDiff      = apart(isOption, 'diff'),
            isZip       = apart(isOption, 'zip'),
            
            ponseStatic = ponse.static(DIR_ROOT, {
                cache: isCache
            }),
            
            funcs       = [
                webconsole.middle({
                    prefix: prefix + '/console',
                    minify: isMinify,
                    online: isOnline
                }),
                
                edward({
                    prefix  : prefix + '/edward',
                    minify  : isMinify,
                    online  : isOnline,
                    diff    : isDiff,
                    zip     : isZip
                }),
               
                dword({
                    prefix  : prefix + '/dword',
                    minify  : isMinify,
                    online  : isOnline,
                    diff    : isDiff,
                    zip     : isZip
                }),
                
                spero({
                    prefix  : prefix + '/spero',
                    minify  : isMinify,
                    online  : isOnline
                }),
                
                remedy({
                    prefix  : prefix + '/remedy',
                    minify  : isMinify,
                    online  : isOnline
                }),
                
                ishtar({
                    prefix  : prefix + '/ishtar',
                    minify  : isMinify,
                    online  : isOnline
                }),
                
                setUrl(prefix),
                
                logout,
                
                auth(),
                
                config.middle,
                
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
    
    function setUrl(pref) {
        return function(req, res, next) {
            var is, prefix;
            
            prefix  = getPrefix(pref);
            is      = !req.url.indexOf(prefix);
            
            if (is) {
                req.url = req.url.replace(prefix, '') || '/';
                
                if (req.url === '/cloudcmd.js')
                    req.url = '/lib/client/cloudcmd.js';
            }
            
            next();
        };
    }
})();
