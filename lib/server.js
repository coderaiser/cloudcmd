(function(){
    "use strict";
    
    if(!global.cloudcmd)
        return console.log(
             '# server.js'                                      + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# easy to use web server.'                        + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
             
    var main                = global.cloudcmd.main,
        
        /*
         * Обьект содержащий все функции и переменные 
         * серверной части Cloud Commander'а
         */
        CloudServer         = {
        /* base configuration */
        Config          : {
            server    : true,
            socket    : true,
            port      : 80
        },
        
        /* server varible */
        Server          : {},
        
        /* КОНСТАНТЫ */
        INDEX           : main.DIR + 'html/index.html'
    },
        DIR                 = main.Dir,
        LIBDIR              = main.LIBDIR,
        SRVDIR              = main.SRVDIR,
        
        /* модуль для работы с путями*/
        Path                = main.path,
        Querystring         = main.querystring,
        
        Minify      = main.minify,
        AppCache    = main.appcache,
        Socket      = main.socket,
        
        /* node v0.4 not contains zlib  */
        Zlib                = main.zlib;  /* модуль для сжатия данных gzip-ом*/
    if(!Zlib)
        Util.log('to use gzip-commpression' +
            'you should use newer node version\n');
    
     /* добавляем  модуль с функциями */
    var Util                = main.util;
    
    /* базовая инициализация  */
    CloudServer.init        = function(pAppCachProcessing){
        var lConfig         = this.Config,
            lMinifyAllowed  = lConfig.minification;
        
        /* Change default parameters of
         * js/css/html minification
         */
        Minify.setAllowed(lMinifyAllowed);
        
        /* Если нужно минимизируем скрипты */
        Util.exec(CloudServer.minimize, lMinifyAllowed);
        
        /* создаём файл app cache */
        if( lConfig.appcache  && AppCache && lConfig.server )
            Util.exec( pAppCachProcessing );
    };
    
    
    /**
     * Функция создаёт сервер
     * @param pConfig
     */
    CloudServer.start = function (pConfig, pProcessing) {
        if(!pProcessing)
            pProcessing = {};
        
        if(pConfig)
            this.Config = pConfig;
        
        else
            Util.log('warning: configuretion file config.json not found...\n' +
                'using default values...\n'                     +
                JSON.stringify(this.Config));
        
        var lConfig = this.Config;
        
        CloudServer.rest            = pProcessing.rest;
        CloudServer.route           = pProcessing.route;
        CloudServer.minimize        = pProcessing.minimize;
        
        this.init(pProcessing.appcache);
        
        this.Port = process.env.PORT            ||  /* c9           */
                    process.env.app_port        ||  /* nodester     */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    lConfig.port;
        
        this.IP   = process.env.IP              ||  /* c9           */
                    this.Config.ip              ||
                    (main.WIN32 ?
                        '127.0.0.1' :
                        '0.0.0.0');
        
        /* server mode or testing mode */
        if (lConfig.server) {
            var http = main.http,
                lError = Util.tryCatchLog(Util.bind(function(){
                    this.Server =  http.createServer( controller );
                    this.Server.listen(this.Port, this.IP);
                    
                    var lListen;
                    if(lConfig.socket && Socket)
                        lListen = Socket.listen(this.Server);
                    
                    Util.log('* Sockets ' + (lListen ? 'running' : 'disabled'));
                    Util.log('* Server running at http://' + this.IP + ':' + this.Port);
            }, this));
            
            if(lError){
                Util.log('Cloud Commander server could not started');
                Util.log(lError);
            }
        }else
            Util.log('Cloud Commander testing mode');
    };
    
    
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
            lConfig     = CloudServer.Config,
            lURL        = main.url,
            lParsedUrl  = lURL.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        /* added supporting of Russian language in directory names */
        lPath = Querystring.unescape(lPath);
        Util.log('pathname: ' + lPath);
        
        Util.log("request for " + lPath + " received...");
        
        if( lConfig.rest )
            lRet = Util.exec(CloudServer.rest, {
                request     : pReq,
                response    : pRes
            });
        
        if( !lRet && CloudServer.route)
            lRet = Util.exec(CloudServer.route, {
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
                    callback    : pCallBack
                });
            });
        }
    }
    
    /**
     * start server function
     * @param pConfig
     * @param pProcessing {index, appcache, rest}
     */
    exports.start           = function(pConfig, pProcessing){
        CloudServer.start(pConfig, pProcessing);
    };
    
    exports.CloudServer     = CloudServer;
    exports.Minify          = Minify;
    exports.AppCache        = AppCache;
    
})();
