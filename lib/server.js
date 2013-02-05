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
        
        /* base configuration */
        Config              = {
            server  : true,
            socket  : true,
            port    : 80
        },
        
        DIR                 = main.Dir,
        LIBDIR              = main.LIBDIR,
        SRVDIR              = main.SRVDIR,
        
        /* модуль для работы с путями*/
        Path                = main.path,
        Querystring         = main.querystring,
        
        Minify              = main.minify,
        AppCache            = main.appcache,
        Socket              = main.socket,
        
        http                = main.http,
        zlib                = main.zlib,
        fs                  = main.fs,
        Util                = main.util,
        ext                 = main.ext,
        
        Server, Rest, Route, Minimize, Port, IP,
        
        OK              = 200,
        FILE_NOT_FOUND  = 404;
    
    /* базовая инициализация  */
    function init(pAppCachProcessing){
        var lMinifyAllowed  = Config.minification;
        
        /* Change default parameters of
         * js/css/html minification
         */
        Minify.setAllowed(lMinifyAllowed);
        
        /* Если нужно минимизируем скрипты */
        Util.exec(Minimize, lMinifyAllowed);
        
        /* создаём файл app cache */
        if( Config.appcache  && AppCache && Config.server )
            Util.exec( pAppCachProcessing );
    }
    
    
    /**
     * start server function
     * @param pConfig
     * @param pProcessing {index, appcache, rest}
     */
    function start(pConfig, pProcessing) {
        if(!pProcessing)
            pProcessing = {};
        
        if(pConfig)
            Config = pConfig;
        
        else
            Util.log('warning: configuretion file config.json not found...\n' +
                'using default values...\n'                     +
                JSON.stringify(Config));
        
        Rest            = pProcessing.rest;
        Route           = pProcessing.route;
        Minimize        = pProcessing.minimize;
        
        init(pProcessing.appcache);
        
        Port = process.env.PORT                 ||  /* c9           */
                    process.env.app_port        ||  /* nodester     */
                    process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                    Config.port;
        
        IP   = process.env.IP                   ||  /* c9           */
                    Config.ip                   ||
                    (main.WIN32 ? '127.0.0.1' : '0.0.0.0');
        
        /* server mode or testing mode */
        if (Config.server) {
            var lError = Util.tryCatchLog(function(){
                    Server =  http.createServer( controller );
                    Server.listen(Port, IP);
                    
                    var lListen;
                    if(Config.socket && Socket)
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
            lURL        = main.url,
            lParsedUrl  = lURL.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        /* added supporting of Russian language in directory names */
        lPath = Querystring.unescape(lPath);
        Util.log('pathname: ' + lPath);
        
        Util.log("request for " + lPath + " received...");
        
        if( Config.rest )
            lRet = Util.exec(Rest, {
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
            if(Config.appcache)
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
                    
                    sendFile({
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
     * Функция создаёт заголовки файлов
     * в зависимости от расширения файла
     * перед отправкой их клиенту
     * @param pName - имя файла
     * @param pGzip - данные сжаты gzip'ом
     */
    function generateHeaders(pName, pGzip, pQuery){
        var lRet,
            lType               = '',
            lContentEncoding    = '',
            lCacheControl       = 0,
            
            lExt                = Util.getExtension(pName);
        
        if( Util.strCmp(lExt, '.appcache') )
            lCacheControl = 1;
        
        lType = ext[lExt] || 'text/plain';
        
        if( !Util.isContainStr(lType, 'img') )
            lContentEncoding = '; charset=UTF-8';
        
        if(Util.strCmp(pQuery, 'download') )
            lType = 'application/octet-stream';
        
        
        if(!lCacheControl)
            lCacheControl = 31337 * 21;
            
        lRet = {
            /* if type of file any, but img - 
             * then we shoud specify charset 
             */
            'Content-Type': lType + lContentEncoding,
            'cache-control': 'max-age=' + lCacheControl,
            'last-modified': new Date().toString(),        
            /* https://developers.google.com/speed/docs/best-practices
                /caching?hl=ru#LeverageProxyCaching */
            'Vary': 'Accept-Encoding'
        };
        
        if(pGzip)
            lRet['content-encoding'] = 'gzip';
            
        return lRet;
    }
    
    /**
     * send file to client thru pipe
     * and gzip it if client support
     * 
     * @param pName - имя файла
     * @param pGzip - данные сжаты gzip'ом
     */
    function sendFile(pParams){
        var lRet,
            lName, lReq, lRes;
        
        if(pParams){
            lName   = pParams.name,
            lReq    = pParams.request,
            lRes    = pParams.response;
        }
        
        if(lName && lRes && lReq){
            var lEnc    = lReq.headers['accept-encoding'] || '',
                lGzip   = lEnc.match(/\bgzip\b/),
                
                lReadStream = fs.createReadStream(lName, {
                    'bufferSize': 4 * 1024
                });                
            
            lReadStream.on('error', function(pError){
                lRes.writeHead(FILE_NOT_FOUND, 'OK');
                lRes.end(String(pError));
            });
            
            lRes.writeHead(OK, generateHeaders(lName, lGzip) );
            
            if (lGzip)
                lReadStream = lReadStream.pipe( zlib.createGzip() );
            
            lReadStream.pipe(lRes);
            
            lRet = true;
        }
        
        return lRet;
    }
    
    exports.generateHeaders = generateHeaders;
    exports.sendFile        = sendFile;
    exports.start           = start;
    
})();
