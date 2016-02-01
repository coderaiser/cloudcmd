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
        createPass  = require(DIR_SERVER + 'password'),
        
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
                value = createPass(config('algo'), value);
                break;
            case 'prefix':
                if (typeof value === 'string') {
                    if (value && !~value.indexOf('/'))
                        value = '/' + value;
                    else if (value.length === 1)
                        value = '';
                }
                
                prefix = value;
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
        var size = cloudfunc.MAX_SIZE,
            pref = getPrefix(prefix);
        
        config.listen(socket, authCheck);
        
        webconsole({
            prefix: prefix + '/console',
            socket: socket,
            authCheck: authCheck
        });
        
        edward.listen(socket, {
            size: size,
            root: root,
            prefix: pref + '/edward'
        });
        
        dword.listen(socket, {
            size: size,
            root: root,
            prefix: pref + '/dword'
        });
        
        spero.listen(socket, {
            root: root,
            prefix: pref + '/spero'
        });
        
        remedy.listen(socket, {
            root: root,
            prefix: pref + '/remedy'
        });
        
        ishtar.listen(socket, {
            root: root,
            prefix: pref + '/ishtar'
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
                
                setUrl(prefix),
                auth(),
                config.middle,
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
                
                spero({
                    minify: isMinify,
                    online: isOnline
                }),
                
                remedy({
                    minify: isMinify,
                    online: isOnline
                }),
                
                ishtar({
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
