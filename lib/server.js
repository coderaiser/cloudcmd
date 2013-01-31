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
        
        /* функция высылает
         * данные клиенту
         */
        sendResponse    : function () {},
        
        /* Асоциативный масив обьектов для
         * работы с ответами сервера
         * высылаемыми на запрос о файле и
         * хранащий информацию в виде
         * Responses[name]=responce;
         */
        Responses       : {},
        
        /*
         * Асоциативный масив статусов
         * ответов сервера
         * высылаемыми на запрос о файле и
         * хранащий информацию в виде
         * Statuses[name] = 404;
         */
        Statuses        : {},
        
        /*
         * queries of file params
         * example: ?download
         */
        Queries         : {},
        
        /* ПЕРЕМЕННЫЕ
         * Поддержка браузером JS */
        NoJS            : true,
        /* Поддержка gzip-сжатия браузером */
        Gzip            : false,
        
        /* server varible */
        Server          : {},
        
        /* КОНСТАНТЫ */
        INDEX           : main.DIR + 'html/index.html'
    },
        DirPath             = '/',
        
        OK                  = 200,
        
        DIR                 = main.Dir,
        LIBDIR              = main.LIBDIR,
        SRVDIR              = main.SRVDIR,
        
        /* модуль для работы с путями*/
        Path                = main.path,
        Fs                  = main.fs,    /* модуль для работы с файловой системой*/
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
    var CloudFunc           = main.cloudfunc,
        Util                = main.util;
    
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
        
        CloudServer.indexProcessing = pProcessing.index;
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
                    this.Server =  http.createServer(this._controller);
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
    CloudServer._controller = function(pReq, pRes)
    {
        /* Читаем содержимое папки, переданное в url */
        var lConfig     = CloudServer.Config,
            lURL        = main.url,
            lParsedUrl  = lURL.parse(pReq.url),
            lPath       = lParsedUrl.pathname,
            
            /* varible contain one of queris:
             * download - change content-type for
             *              make downloading process
             *              from client js
             * json     - /no-js/ will be removed, and
             *              if we will wont get directory
             *              content wi will set json
             *              query like this
             *              ?json
             */
            lQuery = lParsedUrl.query;
        if(lQuery)
            Util.log('query = ' + lQuery);
            
        /* added supporting of Russian language in directory names */
        lPath = Querystring.unescape(lPath);
        Util.log('pathname: ' + lPath);
            
         /* получаем поддерживаемые браузером кодировки*/
         var lAcceptEncoding = pReq.headers['accept-encoding'];
        /* запоминаем поддерживает ли браузер
         * gzip-сжатие при каждом обращении к серверу
         * и доступен ли нам модуль zlib
         */ 
        if (lAcceptEncoding && 
            lAcceptEncoding.match(/\bgzip\b/) && Zlib)
                CloudServer.Gzip = true;
        
        /* путь в ссылке, который говорит
         * что js отключен
         */
        var lNoJS_s = CloudFunc.NOJS,
            lFS_s   = CloudFunc.FS;
        
        Util.log("request for " + lPath + " received...");
            
        if( lConfig.rest ){
            var lRestWas = Util.exec(CloudServer.rest, {
                request     : pReq,
                response    : pRes
            });
            
            if(lRestWas)
                return;
        }
        
        if( CloudServer.route){
            var lRouteWas = Util.exec(CloudServer.route, {
                    name        : lPath,
                    request     : pReq,
                    response    : pRes
                });
            
            if(lRouteWas)
                return;
        }
        
        /* если в пути нет информации ни о ФС,
         * ни об отсутствии js,
         * ни о том, что это корневой
         * каталог - загружаем файлы проэкта
         */
        if ( !Util.isContainStr(lPath, lFS_s)    &&
                  !Util.isContainStr(lPath, lNoJS_s)  &&
                  !Util.strCmp(lPath, '/')            &&
                  !Util.strCmp(lQuery, 'json') ) {
            
            /* если имена файлов проекта - загружаем их         *
             * убираем слеш и читаем файл с текущец директории  */
            
            /* добавляем текующий каталог к пути */
            var lName = '.' + lPath;
            Util.log('reading ' + lName);
            
            /* watching is file changed */
            if(lConfig.appcache)
                AppCache.watch(lName);
            
            Util.log(Path.basename(lName));
            
            var lExt    = Util.getExtension(lName),
                lResult = lExt === '.js' || lExt === '.css' || lExt === '.html';
                            
            if(lResult)
                lResult = Minify.optimize(lName, {
                    request     : pReq,
                    response    : pRes
                });
            
            if(!lResult)
                main.sendFile({
                    name: lName,
                    request: pReq,
                    response: pRes
                });
            
        }else{/* если мы имеем дело с файловой системой*/
            /* если путь не начинаеться с no-js - значит 
             * js включен
             */
            /* убираем пометку cloud, без которой c9.io
             * не работает поскольку путь из двух слешей
             * (/fs/no-js/) - очень короткий, нужно
             * длиннее
             */
            
            if(lPath.indexOf(lNoJS_s) !== lFS_s.length && lPath !== '/')
                CloudServer.NoJS = false;            
            else{
                CloudServer.NoJS = true;
                lPath = Util.removeStr(lPath, lNoJS_s);
            }
            
            /* убираем индекс файловой системы */
            if(lPath.indexOf(lFS_s) === 0){
                lPath = Util.removeStr(lPath, lFS_s);
           
                /* если посетитель только зашел на сайт
                 * no-js будет пустым, как и fs.
                 * Если в пути нету fs - посетитель только зашел на сайт
                 * загружаем его полностью.
                 */
            }
            
            /* if query json setted up
             * load json data, no-js false.
             */
            
            if(lQuery === 'json')
                CloudServer.NoJS = false;
                
            
            /* если в итоге путь пустой
             * делаем его корневым
             */
            if (lPath === '')
                lPath = '/';
                        
            DirPath  = lPath;
            
            CloudServer.Responses[DirPath]  = pRes;
            CloudServer.Statuses[DirPath]   = OK;
            
            /* saving query of current file */
            CloudServer.Queries[DirPath]    = lQuery;
            Util.log(lQuery);
            
            Util.log(DirPath);
            
            
            /* читаем основные данные о файле */
            Fs.stat(DirPath, CloudServer._stated);
            
            /* если установлено сжатие
             * меняем название html-файла и
             * загружаем сжатый html-файл в дальнейшем
             */
            
            var lMinFileName = Minify.getName(main.DIR + 'html/index.html');
            
            CloudServer.INDEX = (Minify._allowed.html ?
                 lMinFileName : CloudServer.INDEX);
            
            /*
             * сохраним указатель на response
             * и на статус ответа
             */            
            CloudServer.Responses[CloudServer.INDEX] = pRes;
            CloudServer.Statuses [CloudServer.INDEX] = OK;
        }
    };
    
    /**
     * Function geted stat information about file
     * @param pError
     * @param pStat
     */
    CloudServer._stated = function(pError, pStat){
        if(pError){
            CloudServer.Statuses[DirPath]  = 404;
            CloudServer.sendResponse('OK', pError.toString(), DirPath);
            
            return;
        }
        
        /* если это каталог - читаем его содержимое */
        if(pStat){
            if(pStat.isDirectory())
                Fs.readdir(DirPath, CloudServer._readDir);
            /* отдаём файл */
            else if(pStat.isFile()){
                Fs.readFile(DirPath, CloudServer.getReadFileFunc(DirPath));
                Util.log('reading file: '+ DirPath);
            }
        }
    };
    
    
    /**
     * Функция читает ссылку или выводит информацию об ошибке
     * @param pError
     * @param pFiles
     */
    CloudServer._readDir = function (pError, pFiles)
    {
        if(pError){
            Util.log(pError);
            
            CloudServer.Statuses[DirPath]  = 404;
            CloudServer.sendResponse('OK', pError.toString(), 
                DirPath);
            return;
        }
        
        /* Если мы не в корне добавляем слеш к будующим ссылкам */       
       if(DirPath !== '/')
            DirPath += '/';
        
        pFiles = pFiles.sort();
        
        var lCount = 0,
            lStats = {};
        
        /* asyn getting file states
         * and putting it to lStats object
         */
        var getFilesStat_f = function(pName){
            return function(pError, pStat){
                if(pError)
                    lStats[pName] = {
                        'mode'          : 0,
                        'size'          : 0,
                        'isDirectory'   : Util.retFalse
                    };
                    
                else
                    lStats[pName] = pStat;
                
                /* if this file is last - moving next */
                if(++lCount === pFiles.length)
                    CloudServer._fillJSON(lStats, pFiles);
            };
        };
        
        if(pFiles.length)
            for(var i = 0; i < pFiles.length; i++)
                /* Получаем информацию о файле */
                Fs.stat(DirPath + pFiles[i], getFilesStat_f(pFiles[i]));
                    
        else
            CloudServer._fillJSON(null, pFiles);
    };
    
    /**
     * Function fill JSON by file stats
     *
     * @param pStats - object, contain file stats.
     *          example {'1.txt': stat}
     *
     * @param pFiles - array of files of current directory
     */
    CloudServer._fillJSON = function(pStats, pFiles){
        /* данные о файлах в формате JSON*/
        var lJSON       = [],
            lJSONFile   = {},
            lHeader, /* заголовок ответа сервера */
            lList;
            
        lJSON[0]        = {
            path    : DirPath,
            size    : 'dir'
        };
        
        for(var i = 0; i < pFiles.length; i++){
            /*
             *Переводим права доступа в 8-ричную систему
             */
            var lName = pFiles[i],
            
                lMode = (pStats[lName].mode-0).toString(8),
                lStats = pStats[lName],
                lIsDir  = lStats.isDirectory();
            
            /* Если папка - выводим пиктограмму папки   *
             * В противоположном случае - файла         */
            lJSONFile = {
                'name'  : pFiles[i],
                'size'  : lIsDir ? 'dir' : lStats.size,
                'uid'   : lStats.uid,
                'mode'  : lMode};
            
            lJSON[i+1] = lJSONFile;
        }
        
        /* если js недоступен
         * или отключен выcылаем html-код
         * и прописываем соответствующие заголовки
         */    
        if(CloudServer.NoJS){
            var lPanel  = CloudFunc.buildFromJSON(lJSON);
            lList       = '<ul id=left class=panel>'  + lPanel + '</ul>' +
                          '<ul id=right class=panel>' + lPanel + '</ul>';
            
            Fs.readFile(CloudServer.INDEX, CloudServer.indexReaded(lList));
            
        }else{
            DirPath = DirPath.substr(DirPath, DirPath.lastIndexOf('/') );
            
            var lQuyery = CloudServer.Queries[DirPath];
            DirPath += '.json';
            CloudServer.Queries[DirPath] = lQuyery;
            
            /* в обычном режиме(когда js включен
             * высылаем json-структуру файлов
             * с соответствующими заголовками
             */        
            lList   = JSON.stringify(lJSON);
            lHeader = main.generateHeaders(DirPath, CloudServer.Gzip, lQuyery);
            
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if(CloudServer.Gzip){
                var lGzipCB = CloudServer.getGzipDataFunc(lHeader, CloudServer.INDEX);
                
                Zlib.gzip(lList, lGzipCB);
            }
            /* если не поддерживаеться - отсылаем данные без сжатия*/
            else
                CloudServer.sendResponse(lHeader, lList, CloudServer.INDEX);
        }  
    };
    
    /**
     *@param pList
     */
    CloudServer.indexReaded = function(pList){
        return function(pError, pIndex){
            if(pError){
                return Util.log(pError);
            }
            
            var lSrv        = CloudServer,
                lIndexName  = lSrv.INDEX;
            
            pIndex = pIndex.toString();
            
            
            var lProccessed,
                lIndexProccessing = lSrv.indexProcessing;
            
            lProccessed = Util.exec(lIndexProccessing, {
                data        : pIndex,
                additional  : pList
            });
            
            if(lProccessed)
                pIndex = lProccessed;
            /* 
             * если браузер поддерживает gzip-сжатие
             * высылаем заголовок в зависимости от типа файла
            */
            var lQuery = lSrv.Queries[lIndexName],
                lHeader = main.generateHeaders(lIndexName, lSrv.Gzip, lQuery);
            
             /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if(lSrv.Gzip) {
                Zlib.gzip(pIndex,
                    lSrv.getGzipDataFunc(lHeader, lIndexName));
            }
            
            /* если не поддерживаеться - отсылаем данные без сжатия*/
            else
                lSrv.sendResponse(lHeader, pIndex, lIndexName);
        };
    };
    
    /** 
     * Функция генерирует функцию считывания файла
     * таким образом, что бы у нас было 
     * имя считываемого файла
     * @param pName - полное имя файла
     */
    CloudServer.getReadFileFunc = function(pName){
    /*
     * @pError          - ошибка
     * @pData           - данные
     *                      или из одного из кешей
     */    
        var lReadFile = function(pError, pData){
            var lSrv = CloudServer;
            if (!pError){
                Util.log('file ' + pName + ' readed');
                
                var lQuery  = lSrv.Queries[pName],
                    lHeader = main.generateHeaders(pName, lSrv.Gzip, lQuery);
                
                /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
                if( lSrv.Gzip  )
                    /* сжимаем содержимое */
                    Zlib.gzip(pData, lSrv.getGzipDataFunc(lHeader, pName));
                else
                    /* высылаем несжатые данные */
                    lSrv.sendResponse(lHeader, pData, pName);
            }
            else{
                Util.log(pError.path);
                if(pError.path !== 'passwd.json'){
                    Util.log(pError);
                    
                    /* sending page not found */
                    lSrv.Statuses[pName] = 404;                
                    lSrv.sendResponse('file not found', pError.toString(), pName);
                }else
                    lSrv.sendResponse('OK', 'passwd.json');        
            }
        };
        
        return lReadFile;
    };
    
    /**
     * Функция получает сжатые данные
     * @param pHeader - заголовок файла
     * @pName
     */
    CloudServer.getGzipDataFunc = function(pHeader, pName){
        return function(error, pResult){
            if(!error)
                CloudServer.sendResponse(pHeader, pResult, pName);
            else{
                Util.log(error);
                CloudServer.sendResponse(pHeader, error);
            }
        };
    };
    /**
     * Функция высылает ответ серверу 
     * @param pHead       - заголовок
     * @param Data       - данные
     * @param pName       - имя отсылаемого файла
     */
    CloudServer.sendResponse = function(pHead, pData, pName){
        /* если у нас есть указатель на responce
         * для соответствующего файла - 
         * высылаем его
         */
        var lResponse   = CloudServer.Responses[pName],
            lStatus     = CloudServer.Statuses[pName];
        
        if(lResponse){
            lResponse.writeHead(lStatus, pHead);
            lResponse.end(pData);
            
            Util.log(pName + ' sended');
        }
    };
    
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
