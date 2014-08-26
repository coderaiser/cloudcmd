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
        https               = require('https'),
        
        Util                = require(DIR_LIB + 'util'),
        CloudFunc           = require(DIR_LIB + 'cloudfunc'),
        
        minify              = require(DIR_SERVER + 'minify'),
        AppCache            = require(DIR_SERVER + 'appcache'),
        Socket              = require(DIR_SERVER + 'socket'),
        Console             = require(DIR_SERVER + 'console'),
        Terminal            = !WIN ? require(DIR_SERVER + 'terminal') : {
            init: function() {}
        },
        join                = require(DIR_SERVER + 'join'),
        ponse               = require(DIR_SERVER + 'ponse'),
        express             = require(DIR_SERVER + 'express'),
        
        expressApp,
        
        Rest, Route;
    
    /* базовая инициализация  */
    function init(appCacheCallback) {
        var config = main.config;
        
        /* создаём файл app cache */
        if (config.appcache  && AppCache && config.server)
            Util.exec(appCacheCallback);
    }
    
    
    /**
     * start server function
     * 
     * @param options
     */
    function start(options) {
        var redirectServer, port, ip, ssl, sslPort,
            HTTP        = 'http://',
            HTTPS       = 'https://', 
            config      = main.config;
        
        if (!options)
            options = {};
        
        Rest    =   options.rest;
        Route   =   options.route;
        
        init(options.appcache);
        
        port    =   process.env.PORT            ||  /* c9           */
                    process.env.app_port        ||  /* nodester     */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    config.port,
        ip      =   process.env.IP              ||  /* c9           */
                    config.ip                   || 
                    '0.0.0.0',
        
        ssl     = options.ssl,
        sslPort = config.sslPort;
        
        if (config.server)
            if (!ssl) 
                createServer(port, ip, HTTP);
            else {
                createRedirect(port, ip, HTTPS, sslPort);
                
                createServer(sslPort, ip, HTTP, ssl, function() {
                    Util.log('Could not use https port: ' + sslPort);
                    redirectServer.close();
                    Util.log('* Redirection http -> https removed');
                    createServer(port, ip);
                });
            }
    }
    
    function createRedirect(port, ip, protocol, sslPort) {
        var server = function(req, res) {
            var url,
                host        = req.headers.host,
                parsed      = URL.parse(host),
                hostName    = parsed.protocol;
            
            url             = protocol + hostName + sslPort + req.url;
            
            ponse.redirect(url, res);
        };
        
        Util.log('* Redirection http -> https is setted up');
        logServer(port, ip, protocol);
        
        http.createServer(server)
            .listen(port, ip);
    }
    
    function createServer(port, ip, protocol, ssl, callback) {
        var server, app, respondApp,
            config      = main.config,
            
            middle      = controller.middle(DIR),
            
            isMinify    = function() {
                var isMinify = main.config.minify;
                
                return isMinify;
            },
            funcs       = [
                Rest,
                Route,
                join({
                    minify: isMinify
                }),
                
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
        
        if (ssl)
            server      = https.createServer(ssl, app);
        else
            server      = http.createServer(app);
        
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
        var listen, msg,
            config  = main.config,
            status  = 'off';
        
        if (config.socket && Socket) {
            listen = Socket.listen(server);
            
            if (listen) {
                status = 'on';
                Console();
                Terminal();
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
        
        /* watching is file changed */
        if (config.appcache)
            AppCache.watch(name);
        
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
