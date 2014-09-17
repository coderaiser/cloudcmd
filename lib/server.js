 (function() {
    'use strict';
    
    var DIR                 = __dirname + '/../',
        DIR_LIB             = DIR       + 'lib/',
        DIR_SERVER          = DIR_LIB   + 'server/',
        
        WIN                 = process.platform === 'WIN32',
        
        http                = require('http'),
        
        Util                = require(DIR_LIB + 'util'),
        CloudFunc           = require(DIR_LIB + 'cloudfunc'),
        
        minify              = require(DIR_SERVER + 'minify'),
        
        terminal            = !WIN ? require(DIR_SERVER + 'terminal') : function() {},
        
        rest                = require(DIR_SERVER + 'rest'),
        route               = require(DIR_SERVER + 'route'),
        
        config              = require(DIR_SERVER + 'config'),
        
        join                = require(DIR_SERVER + 'join'),
        ponse               = require(DIR_SERVER + 'ponse'),
        express             = require(DIR_SERVER + 'express'),
        tryRequire          = require(DIR_SERVER + 'tryRequire'),
        
        io                  = tryRequire('socket.io'),
        emptyFunc           = function(req, res, next) {
            Util.exec(next);
        },
        
        webconsole, expressApp;
        
        emptyFunc.middle    = function() {
            return emptyFunc;
        };
        
        webconsole          = tryRequire('console-io', function(error) {
            if (error)
                Util.log(error.message);
        }) || emptyFunc;
    
    /**
     * start server function
     * 
     */
    module.exports  = function() {
        var port, ip,
            HTTP        = 'http://';
        
        port    =   process.env.PORT            ||  /* c9           */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    config('port'),
        
        ip      =   process.env.IP              ||  /* c9           */
                    config('ip')                || 
                    '0.0.0.0';
        
        if (config('server'))
            createServer(port, ip, HTTP);
    };
    
    function createServer(port, ip, protocol, callback) {
        var server, app, respondApp,
            
            isOption    = function(name) {
                return config(name);
            },
            
            isMinify    = isOption.bind(null, 'minify'),
            isOnline    = isOption.bind(null, 'online'),
            isCache     = isOption.bind(null, 'cache'),
            
            ponseStatic = ponse.static(DIR, {
                cache: isCache
            }),
            
            funcs       = [
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
                })
            ];
            
        expressApp      = express.getApp(funcs, {
            auth    : config.auth,
            username: config.username,
            password: config.password
        });
        
        if (expressApp) {
            app             = expressApp;
            app.use(ponseStatic);
        } else {
            funcs.push(ponseStatic);
            
            respondApp      = Util.exec.with(respond, funcs);
            app             = respondApp;
        }
        
        server = http.createServer(app);
        
        server.on('error', function(error) {
            Util.log(error);
            Util.exec(callback, error);
        });
        
        server.listen(port, ip);
        
        logServer(port, ip, protocol);
        addSockets(server);
    }
    
    function logServer(port, ip, http) {
        Util.log('* Server running at ' + http + ip + ':' + port);
    }
    
    function addSockets(server) {
        var socket, msg,
            status  = 'off';
        
        if (io && config('socket')) {
            socket = io.listen(server);
            
            if (socket) {
                status = 'on';
                
                webconsole({
                    socket: socket
                });
                
                terminal(socket);
            }
        }
        
        msg     = CloudFunc.formatMsg('sockets', '', status);
        
        Util.log(msg);
    }
    
    function respond(funcs, req, res) {
        funcs = funcs.map(function(func) {
                return Util.exec.with(func, req, res);
            });
        
        Util.exec.series(funcs);
    }
    
})();
