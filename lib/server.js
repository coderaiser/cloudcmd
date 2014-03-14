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
        
        DIR                 = main.DIR,
        LIBDIR              = main.LIBDIR,
        SRVDIR              = main.SRVDIR,
        
        URL                 = main.url,
        Path                = main.path,
        Querystring         = main.querystring,
        
        Minify              = main.minify,
        CloudFunc           = main.cloudfunc,
        AppCache            = main.appcache,
        Socket              = main.socket,
        Console             = main.console,
        Terminal            = main.terminal,
        join                = main.srvrequire('join'),
        
        zlib                = main.zlib,
        http                = main.http,
        https               = main.https,
        Util                = main.util,
        express             = main.express,
        expressApp,
        files               = main.files,
        
        Server, Rest, Route;
        
        join                = join && Util.bind(join, beforeJoin, DIR) || Util.exec.bind(Util);
    
    /* базовая инициализация  */
    function init(pAppCachProcessing) {
        var config = main.config;
        
        /* создаём файл app cache */
        if (config.appcache  && AppCache && config.server )
            Util.exec( pAppCachProcessing );
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
                    (main.WIN32 ? '127.0.0.1' : '0.0.0.0'),
        
        ssl     = options.ssl,
        sslPort = config.sslPort;
        
        /* server mode or testing mode */
        if (!config.server)
            Util.log('Cloud Commander testing mode');
        else
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
            
            main.redirect({
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
        var server, app;
        
        expressApp  = express.getApp([
            Rest,
            Route,
            join,
            controller
        ]);
        
        app         = expressApp || respond;
        
        if (ssl)
            server  =  https.createServer(ssl, app);
        else
            server  = http.createServer(app);
        
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
    
    function respond(req, res) {
        var i, n, func,
            funcs = ([
                Rest,
                Route,
                join,
                controller
            ]);
        
        n = funcs.length;
        for (i = 0; i < n; i++) {
            func        = funcs[i];
            funcs[i]    = func.bind(null, req, res);
        }
        
        Util.loadOnLoad(funcs);
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
            path        = main.getPathName(req),
            name        = path;
        
        if (!expressApp)
            Util.log(req.method + ' ' + path + query);
        
        /* watching is file changed */
        if (config.appcache)
            AppCache.watch(name);
        
        name    = Path.join(DIR, name);
        check   = checkExtension(name);
        result  = isMin && check;
        
        Util.ifExec(!result,
            function(params) {
                var sendName = params && params.name || name;
                
                main.sendFile({
                    name        : sendName,
                    cache       : config.cache,
                    gzip        : true,
                    request     : req,
                    response    : res
                });
        }, function(callback) {
            Minify.optimize(name, {
                callback    : callback,
                returnName  : true
            });
        });
    }
    
    function minify(name, callback) {
        Minify.optimize(name, {
            callback    : callback
        });
    }
    
    function beforeJoin(names, callback) {
        var i, name, check, minName, dir, funcs,
            config  = main.config,
            n       = names.length;
            
        if (!config.minify)
            Util.exec(callback);
        else {
            for (i = 0; i < n; i++) {
                    name        = Path.join(DIR, names[i]);
                    check       = checkExtension(name);
                    
                    if (check) {
                        minName = Minify.getName(name);
                        
                        if (name !== minName) {
                            names[i] = minName;
                            dir = '';
                        }
                    }
                    
                    funcs.push(Util.bind(minify, name));
                }
                
                Util.asyncCall(funcs, callback);
        }
    }
    
    function checkExtension(name) {
        var ret;
        
        ret = Util.checkExtension(name, ['.js', '.css', '.html']);
        
        return ret;
    }
    
    exports.start           = start;
    
})();
