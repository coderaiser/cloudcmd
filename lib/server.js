 (function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# server.js'                                      + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# easy to use web server.'                        + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main                = global.cloudcmd.main,
        
        DIR                 = __dirname + '/../',
        DIR_LIB             = DIR       + 'lib/',
        DIR_SERVER          = DIR_LIB   + 'server/',
        
        WIN                 = process.platform === 'WIN32',
        
        URL                 = require('url'),
        path                = require('path'),
        http                = require('http'),
        
        Util                = require(DIR_LIB + 'util'),
        CloudFunc           = require(DIR_LIB + 'cloudfunc'),
        
        minify              = require(DIR_SERVER + 'minify'),
        
        terminal            = !WIN ? require(DIR_SERVER + 'terminal') : function() {},
        join                = require(DIR_SERVER + 'join'),
        ponse               = require(DIR_SERVER + 'ponse'),
        express             = require(DIR_SERVER + 'express'),
        tryRequire          = require(DIR_SERVER + 'tryRequire'),
        
        io                  = tryRequire('socket.io'),
        emptyFunc           = function(req, res, next) {
            Util.exec(next);
        },
        
        webconsole, expressApp, Rest, Route;
        
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
     * @param options
     */
    function start(options) {
        var port, ip,
            HTTP        = 'http://',
            config      = main.config;
        
        if (!options)
            options = {};
        
        Rest    =   options.rest;
        Route   =   options.route;
        
        port    =   process.env.PORT            ||  /* c9           */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    config.port,
        
        ip      =   process.env.IP              ||  /* c9           */
                    config.ip                   || 
                    '0.0.0.0';
        
        if (config.server)
            createServer(port, ip, HTTP);
    }
    
    function createServer(port, ip, protocol, callback) {
        var server, app, respondApp,
            config      = main.config,
            
            middle      = controller.middle(DIR),

            isOption    = function(name) {
                return function() {
                    return main.config[name];
                };
            },
            
            isMinify    = isOption('minify'),
            isOnline    = isOption('online'),
            
            funcs       = [
                Rest,
                Route,
                
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
            app.use(middle);
        } else {
            funcs.push(controller.middle(DIR));
            
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
            config  = main.config,
            status  = 'off';
        
        if (config.socket && io) {
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
    
    /**
     * Главная функция, через которую проихсодит
     * взаимодействие, обмен данными с клиентом
     * @param req - запрос клиента (Request)
     * @param res - ответ сервера (Response)
     */
    function controller(dir, req, res) {
        var config      = main.config,
            parsedUrl   = URL.parse(req.url),
            query       = parsedUrl.search || '',
            name        = ponse.getPathName(req);
        
        if (!expressApp)
            Util.log(req.method + ' ' + name + query);
        
        name            = path.join(dir, name);
        
        ponse.sendFile({
            name        : name,
            cache       : config.cache,
            gzip        : true,
            request     : req,
            response    : res
        });
        
    }
    
    controller.middle       = function(dir) {
        return controller.bind(null, dir);
    };
    
    exports.start           = start;
    
})();
