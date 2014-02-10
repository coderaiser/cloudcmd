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
        
        zlib                = main.zlib,
        http                = main.http,
        https               = main.https,
        Util                = main.util,
        express             = main.express,
        expressApp,
        files               = main.files,
        
        Server, Rest, Route;
    
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
        var redirectServer,
            config         = main.config;
        
        if (!options)
            options = {};
        
        Rest            =   options.rest;
        Route           =   options.route;
        
        init(options.appcache);
        
        var lPort       =   process.env.PORT            ||  /* c9           */
                            process.env.app_port        ||  /* nodester     */
                            process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                            config.port,
            
            lIP         =   process.env.IP              ||  /* c9           */
                            config.ip                   ||
                            (main.WIN32 ? '127.0.0.1' : '0.0.0.0'),
            
            lSSL        = options.ssl,
            lSSLPort    = config.sslPort,
            lHTTP       = 'http://',
            lHTTPS      = 'https://',
            
            lSockets    = function(pServer) {
                var listen, msg,
                    status = 'off';
                
                if (config.socket && Socket) {
                    listen = Socket.listen(pServer);
                    
                    if (listen) {
                        status = 'on';
                        Console.init();
                        Terminal.init();
                    }
                }
                
                msg     = CloudFunc.formatMsg('sockets', '', status);
                
                Util.log(msg);
            },
            
            lHTTPServer = function() {
                expressApp  = express.getApp([
                    Rest,
                    Route,
                    join,
                    controller
                ]);
                
                Server      = http.createServer(expressApp || respond);
                
                Server.on('error', Util.log.bind(Util));
                Server.listen(lPort, lIP);
                lServerLog(lHTTP, lPort);
                lSockets(Server);
            },
            
            lServerLog  = function(http, port) {
                Util.log('* Server running at ' + http + lIP + ':' + port);
            };
        /* server mode or testing mode */
        if (config.server)
            if (lSSL) {
                Util.log('* Redirection http -> https is setted up');
                lServerLog(lHTTP, lPort);
                
                redirectServer =  http.createServer(function(req, res) {
                    var url,
                        host        = req.headers.host,
                        parsed      = url.parse(lHost),
                        hostName    = parsed.protocol;
                    
                    url             = lHTTPS + hostName + lSSLPort + req.url;
                    
                    main.redirect({
                        response: res,
                        url: url
                    });
                });
                
                redirectServer.listen(lPort, lIP);
                
                Server  =  https.createServer(lSSL, respond);
                Server.on('error', function (error) {
                    Util.log('Could not use https port: ' + lSSLPort);
                    Util.log(error);
                    redirectServer.close();
                    Util.log('* Redirection http -> https removed');
                    lHTTPServer();
                });
                
                lSockets(Server);
                
                Server.listen(lSSLPort, lIP);
                lServerLog(lHTTPS, lSSLPort);
            } else
                lHTTPServer();
        else
            Util.log('Cloud Commander testing mode');
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
    function controller(pReq, pRes) {
        /* Читаем содержимое папки, переданное в url */
        var lRet, lMin, lCheck, lResult, data,
            lConfig     = main.config,
            parsedUrl   = URL.parse(pReq.url),
            query       = parsedUrl.search || '',
            path        = main.getPathName(pReq),
            lName       = path;
        
        if (!expressApp)
            Util.log(pReq.method + ' ' + path + query);
        
        data = {
            name        : path,
            request     : pReq,
            response    : pRes
        };
        
        /* watching is file changed */
        if (lConfig.appcache)
            AppCache.watch(lName);
        
        lName   = Path.join(DIR, lName);
        lMin    = lConfig.minify,
        lCheck  = checkExtension(lName);
        lResult = lMin && lCheck;
        
        Util.ifExec(!lResult,
            function(pParams) {
                var lSendName = pParams && pParams.name || lName;
                
                main.sendFile({
                    name        : lSendName,
                    cache       : lConfig.cache,
                    gzip        : true,
                    request     : pReq,
                    response    : pRes
                });
        }, function(pCallBack) {
            Minify.optimize(lName, {
                callback    : pCallBack,
                returnName  : true
            });
        });
    }
    
    function minify(name) {
        return function(callback) {
            Minify.optimize(name, {
                callback    : callback
            });
        };
    }
    
    function join(request, response, callback) {
        var names, i, n, name, minName, stream, check,
            funcs       = [],
            config      = main.config,
            dir         = DIR,
            gzip        = zlib.createGzip(),
            isGzip      = main.isGZIP(request),
            path        = main.getPathName(request),
            
            isJoin      = CloudFunc.isJoinURL(path),
            readPipe    = function() {
                main.mainSetHeader({
                    name        : names[0],
                    cache       : config.cache,
                    gzip        : isGzip,
                    request     : request,
                    response    : response
                });
                
                if (!isGzip)
                    stream = response;
                else
                    stream = gzip;
                
                files.readPipe({
                    names       : names,
                    dir         : dir,
                    write       : stream,
                    callback    : function(error) {
                        var errorStr;
                        
                        if (error)
                            if (!response.headersSent)
                                main.sendError({
                                    request     : request,
                                    response    : response,
                                    name        : path
                                }, error);
                            else {
                                Util.log(error);
                                errorStr = error.toString();
                                stream.end(errorStr);
                            }
                    }
                });
                
                /* 
                 * pipe should be setted up after
                 * readPipe called with stream param
                 */
                if (isGzip)
                    gzip.pipe(response);
            };
        
        if (isJoin) {
            names   = CloudFunc.getJoinArray(path);
            n       = names.length;
            
            if (!config.minify)
                readPipe();
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
                    
                    funcs.push(minify(name));
                }
                Util.asyncCall(funcs, readPipe);
            }
        } else
            Util.exec(callback);
        
        return isJoin;
    }
    
    function checkExtension(name) {
        var ret;
        
        ret = Util.checkExtension(name, ['.js', '.css', '.html']);
        
        return ret;
    }
    
    exports.start           = start;
    
})();
