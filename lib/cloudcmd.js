(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_ROOT    = DIR + '../',
        DIR_SERVER  = DIR       + 'server/',
        
        Util        = require(DIR   + 'util'),
        
        auth        = require(DIR_SERVER    + 'auth'),
        config      = require(DIR_SERVER    + 'config'),
        edit        = require(DIR_SERVER    + 'edit'),
        rest        = require(DIR_SERVER    + 'rest'),
        route       = require(DIR_SERVER    + 'route'),
        
        join        = require('join-io'),
        ponse       = require('ponse'),
        mollify     = require('mollify'),
         
        WIN         = process.platform === 'WIN32',
        terminal    = !WIN ? require(DIR_SERVER + 'terminal') : function() {},
        
        webconsole,
        
        emptyFunc           = function(req, res, next) {
            next();
        };
        
        emptyFunc.middle    = function() {
            return emptyFunc;
        };
        
        webconsole  = require('console-io');
        
    module.exports = function(params) {
        var keys,
            p               = params || {},
            prefix          = p.prefix || '/cloudcmd',
            prefixRegExp    = new RegExp('^' + prefix),
            funcs           = cloudcmd(),
            middle          = respond.bind(null, prefixRegExp, funcs);
        
        if (params) {
            keys = Object.keys(params);
            
            keys.forEach(function(name) {
                config(name, params[name]);
            });
        }
        
        return middle;
    };
    
    module.exports.listen   = function(socket) {
        Util.check(arguments, ['socket']);
        
        webconsole({
            socket: socket
        });
            
        terminal(socket);
        edit(socket);
        config.socket(socket);
    };
    
    function cloudcmd() {
        var isOption    = function(name) {
                return config(name);
            },
            
            isMinify    = isOption.bind(null, 'minify'),
            isOnline    = isOption.bind(null, 'online'),
            isCache     = isOption.bind(null, 'cache'),
            
            authFunc    = config('auth') ? auth() : emptyFunc,
            
            ponseStatic = ponse.static(DIR_ROOT, {
                cache: isCache
            }),
            
            funcs       = [
                authFunc,
                config(),
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
                
                mollify({
                    dir : DIR_ROOT,
                    is  : isMinify
                }),
                
                ponseStatic
            ];
        
        return funcs;
    }
    
    function respond(regExp, funcs, req, res) {
        var is      = regExp.test(req.url);
        
        if (is) {
            req.url = req.url.replace(regExp, '') || '/';
            
            if (req.url === '/cloudcmd.js')
                req.url = '/lib/client/cloudcmd.js';
        }
        
        funcs = funcs.map(function(func) {
            return Util.exec.with(func, req, res);
        });
        
        Util.exec.series(funcs);
    }
})();
