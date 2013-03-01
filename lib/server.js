(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
             '# server.js'                                      + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# easy to use web server.'                        + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
             
    var main                = global.cloudcmd.main,
        
        DIR                 = main.Dir,
        LIBDIR              = main.LIBDIR,
        SRVDIR              = main.SRVDIR,
        
        /* модуль для работы с путями */
        Path                = main.path,
        Querystring         = main.querystring,
        
        Minify              = main.minify,
        AppCache            = main.appcache,
        Socket              = main.socket,
        
        http                = main.http,
        Util                = main.util,
        
        Server, Rest, Route, Minimize, Port, IP;
    
    /* базовая инициализация  */
    function init(pAppCachProcessing){
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
        
        Rest            = pProcessing.rest;
        Route           = pProcessing.route;
        Minimize        = pProcessing.minimize;
        
        init(pProcessing.appcache);
        
        Port = process.env.PORT                 ||  /* c9           */
                    process.env.app_port        ||  /* nodester     */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    lConfig.port;
        
        IP   = process.env.IP                   ||  /* c9           */
                    lConfig.ip                   ||
                    (main.WIN32 ? '127.0.0.1' : '0.0.0.0');
        
        /* server mode or testing mode */
        if (lConfig.server) {
            var lError = Util.tryCatchLog(function(){
                    Server =  http.createServer( controller );
                    Server.listen(Port, IP);
                    
                    var lListen;
                    if(lConfig.socket && Socket)
                        lListen = Socket.listen(Server);
                    
                    Util.log('* Sockets ' + (lListen ? 'running' : 'disabled'));
                    Util.log('* Server running at http://' + IP + ':' + Port);
            });
            
            if(lError){
                Util.log('Cloud Commander server could not started');
                Util.log(lError);
            }
        }else
            Util.log('Cloud Commander testing mode');
    }
    
    
    /**
     * Главная функция, через которую проихсодит
     * взаимодействие, обмен данными с клиентом
     * @param req - запрос клиента (Request)
     * @param res - ответ сервера (Response)
     */
    function controller(pReq, pRes)
    {
        /* Читаем содержимое папки, переданное в url */
        var lRet,
            lConfig     = main.config,
            lURL        = main.url,
            lParsedUrl  = lURL.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        /* added supporting of Russian language in directory names */
        lPath = Querystring.unescape(lPath);
        Util.log('pathname: ' + lPath);
        
        Util.log("request for " + lPath + " received...");
        
        if( lConfig.rest )
            lRet = Util.exec(Rest, {
                name        : lPath,
                request     : pReq,
                response    : pRes
            });
        
        if( !lRet && Route)
            lRet = Util.exec(Route, {
                    name        : lPath,
                    request     : pReq,
                    response    : pRes
                });
        
        if(!lRet){
            /* добавляем текующий каталог к пути */
            var lName = '.' + lPath;
            Util.log('reading ' + lName);
            
            /* watching is file changed */
            if(lConfig.appcache)
                AppCache.watch(lName);
            
            Util.log(Path.basename(lName));
            
            var lMin    = Minify.allowed,
                lExt    = Util.getExtension(lName),
                lResult =   lExt === '.js'      && lMin.js  ||
                            lExt === '.css'     && lMin.css ||
                            lExt === '.html'    && lMin.html;
            
            Util.ifExec(!lResult,
                function(pParams){
                    var lSendName = pParams && pParams.name || lName;
                    
                    main.sendFile({
                        name        : lSendName,
                        request     : pReq,
                        response    : pRes
                    });
            }, function(pCallBack){
                Minify.optimize(lName, {
                    request     : pReq,
                    response    : pRes,
                    callback    : pCallBack,
                    returnName  : true
                });
            });
        }
    }
    
    exports.start           = start;
    
})();
