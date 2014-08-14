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
        
        DIR                 = './',
        DIR_SERVER          = DIR + 'server/',
        
        WIN                 = process.platform === 'WIN32',
        
        URL                 = require('url'),
        Path                = require('path'),
        http                = require('http'),
        https               = require('https'),
        
        Util                = require(DIR + 'util'),
        CloudFunc           = require(DIR + 'cloudfunc'),
        
        Minify              = require(DIR_SERVER + 'minify'),
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
     * @param pConfig
     * @param pProcessing {index, appcache, rest}
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
            
            ponse.redirect({
                response: res,
                url: url
            });
        };
        
        Util.log('* Redirection http -> https is setted up');
        logServer(port, ip, protocol);
        
        http.createServer(server)
            .listen(port, ip);
    }
    
    function createServer(port, ip, protocol, ssl, callback) {
        var server, app,
            funcs       = [
                Rest,
                Route,
                join({
                    minify: function() {
                        var isMinify = main.config.minify;
                        
                        return isMinify;
                    }
                    
                }),
                controller
            ],
            
            respondApp  = Util.exec.with(respond, funcs);
        
        expressApp      = express.getApp(funcs);
        
        app             = expressApp || respondApp;
        
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
                Console.init();
                Terminal.init();
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
    function controller(req, res) {
        var check, result,
            config      = main.config,
            isMin       = config.minify,
            parsedUrl   = URL.parse(req.url),
            query       = parsedUrl.search || '',
            path        = ponse.getPathName(req),
            name        = path;
        
        if (!expressApp)
            Util.log(req.method + ' ' + path + query);
        
        /* watching is file changed */
        if (config.appcache)
            AppCache.watch(name);
        
        name    = Path.join(DIR, name);
        check   = checkExt(name);
        result  = isMin && check;
        
        Util.exec.if(!result,
            function(error, params) {
                var sendName = params && params.name || name;
                
                ponse.sendFile({
                    name        : sendName,
                    cache       : config.cache,
                    gzip        : true,
                    request     : req,
                    response    : res
                });
        }, function(callback) {
            Minify.optimize(name, {
                returnName  : true
            }, callback);
        });
    }
    
    function checkExt(name) {
        var ret;
        
        ret = Util.checkExt(name, ['js', 'css', 'html']);
        
        return ret;
    }
    
    exports.start           = start;
    
})();
