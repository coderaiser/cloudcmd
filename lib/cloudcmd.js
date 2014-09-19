(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_ROOT    = DIR + '../',
        DIR_SERVER  = DIR       + 'server/',
        
        Util        = require(DIR   + 'util'),
        
        auth        = require(DIR_SERVER    + 'auth'),
        config      = require(DIR_SERVER    + 'config'),
        minify      = require(DIR_SERVER    + 'minify'),
        rest        = require(DIR_SERVER    + 'rest'),
        route       = require(DIR_SERVER    + 'route'),
        join        = require(DIR_SERVER    + 'join'),
        ponse       = require(DIR_SERVER    + 'ponse'),
        tryRequire  = require(DIR_SERVER    + 'tryRequire'),
        
        WIN         = process.platform === 'WIN32',
        terminal    = !WIN ? require(DIR_SERVER + 'terminal') : function() {},
        
        webconsole,
        
        emptyFunc           = function(req, res, next) {
            Util.exec(next);
        };
        
        emptyFunc.middle    = function() {
            return emptyFunc;
        };
        
        webconsole  = tryRequire('console-io', function(error) {
            if (error)
                Util.log(error.message);
        }) || emptyFunc;
        
        
    module.exports = function(params) {
        var keys,
            funcs   = cloudcmd(),
            middle  = respond.bind(null, funcs);
        
        if (params) {
            keys = Object.keys(params);
            
            keys.forEach(function(name) {
                config(name, params[name]);
            });
        }
        
        return middle;
    };
    
    module.exports.listen   = function(socket) {
        Util.checkArgs(arguments, ['socket']);
        
        webconsole({
            socket: socket
        });
            
        terminal(socket);
    };
    
    function cloudcmd() {
        var isOption    = function(name) {
                return config(name);
            },
        
            isMinify    = isOption.bind(null, 'minify'),
            isOnline    = isOption.bind(null, 'online'),
            isCache     = isOption.bind(null, 'cache'),
            
            ponseStatic = ponse.static(DIR_ROOT, {
                cache: isCache
            }),
            
            funcs       = [
                auth(),
                rest,
                route,
                
                join({
                    minify: isMinify
                }),
                
                webconsole.middle('/console', isMinify, isOnline),
                
                minify({
                    dir : DIR,
                    log : true,
                    is  : isMinify
                }),
                
                ponseStatic
            ];
        
        return funcs;
    }
    
    function respond(funcs, req, res) {
        funcs = funcs.map(function(func) {
                return Util.exec.with(func, req, res);
            });
        
        Util.exec.series(funcs);
    }
})();
