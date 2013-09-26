(function() {
    'use strict';
    
    if(!global.cloudcmd)
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
        AppCache            = main.appcache,
        Socket              = main.socket,
        
        http                = main.http,
        https               = main.https,
        Util                = main.util,
        
        Server, Rest, Route, Minimize;
    
    /* базовая инициализация  */
    function init(pAppCachProcessing) {
        var lConfig         = main.config,
            lMinifyAllowed  = lConfig.minification;
        
        /* Change default parameters of
         * js/css/html minification
         */
        Minify.setAllowed(lMinifyAllowed);
        
        /* Если нужно минимизируем скрипты */
        Util.exec(Minimize, lMinifyAllowed);
        
        /* создаём файл app cache */
        if( lConfig.appcache  && AppCache && lConfig.server )
            Util.exec( pAppCachProcessing );
    }
    
    
    /**
     * start server function
     * @param pConfig
     * @param pProcessing {index, appcache, rest}
     */
    function start(pProcessing) {
        var lConfig         = main.config;
        
        if(!pProcessing)
            pProcessing = {};
        
        Rest            =   pProcessing.rest;
        Route           =   pProcessing.route;
        Minimize        =   pProcessing.minimize;
        
        init(pProcessing.appcache);
        
        var lPort       =   process.env.PORT            ||  /* c9           */
                            process.env.app_port        ||  /* nodester     */
                            process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                            lConfig.port,
        
            lIP         =   process.env.IP              ||  /* c9           */
                            lConfig.ip                  ||
                            (main.WIN32 ? '127.0.0.1' : '0.0.0.0'),
                    
            lSSL        = pProcessing.ssl,
            lSSLPort    = lConfig.sslPort,
            lHTTP       = 'http://',
            lHTTPS      = 'https://',
            
            lSockets    = function(pServer) {
                var lListen;
                if(lConfig.socket && Socket)
                    lListen = Socket.listen(pServer);
                
                Util.log('* Sockets ' + (lListen ? 'running' : 'disabled'));
            },
            
            lHTTPServer = function() {
                Server  =  http.createServer( controller );
                Server.on('error', function (pError) {
                    Util.log(pError);
                });
                Server.listen(lPort, lIP);
                lServerLog(lHTTP, lPort);
                lSockets(Server);
            },
            
            lServerLog  = function(pHTTP, pPort) {
                Util.log('* Server running at ' + pHTTP + lIP + ':' + pPort);
            };
        /* server mode or testing mode */
        if (lConfig.server) {
            if (lSSL) {
                Util.log('* Redirection http -> https is setted up');
                lServerLog(lHTTP, lPort);
                var lRedirectServer  =  http.createServer( function(pReq, pRes) {
                    var lHost       = pReq.headers.host;
                    
                    main.redirect({
                        response: pRes,
                        url: lHTTPS + lHost + pReq.url
                    });
                });
                
                lRedirectServer.listen(lPort, lIP);
                
                Server  =  https.createServer( lSSL, controller );
                Server.on('error', function (pError) {
                    Util.log('Could not use https port: ' + lSSLPort);
                    Util.log(pError);
                    lRedirectServer.close();
                    Util.log('* Redirection http -> https removed');
                    lHTTPServer();
                });
                
                lSockets(Server);
                
                Server.listen(lSSLPort, lIP);
                lServerLog(lHTTPS, lSSLPort);
            }
            else
                lHTTPServer();
        }else
            Util.log('Cloud Commander testing mode');
    }
    
    
    /**
     * Главная функция, через которую проихсодит
     * взаимодействие, обмен данными с клиентом
     * @param req - запрос клиента (Request)
     * @param res - ответ сервера (Response)
     */
    function controller(pReq, pRes) {
        /* Читаем содержимое папки, переданное в url */
        var lRet, lName, lMin, lExt, lResult,
            lConfig     = main.config,
            lParsedUrl  = URL.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        /* added supporting of Russian language in directory names */
        lPath = Querystring.unescape(lPath);
        Util.log('pathname: ' + lPath);
        
        Util.log("request for " + lPath + " received...");
        
        var lData = {
            name        : lPath,
            request     : pReq,
            response    : pRes
        };
        
        if( lConfig.rest )
            lRet = Util.exec(Rest, lData);
        
        if( !lRet && Route)
            lRet = Util.exec(Route, lData);
        
        if(!lRet) {
            lName = lData.name;
            Util.log('reading ' + lName);
            
            /* watching is file changed */
            if(lConfig.appcache)
                AppCache.watch(lName);
            
            Util.log(Path.basename(lName));
            
            lName   = Path.join(DIR, lName);
            lMin    = Minify.allowed,
            lExt    = Util.getExtension(lName),
            lResult =   lExt === '.js'      && lMin.js  ||
                        lExt === '.css'     && lMin.css ||
                        lExt === '.html'    && lMin.html;
            
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
    }
    
    exports.start           = start;
    
})();
