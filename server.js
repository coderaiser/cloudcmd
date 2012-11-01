"use strict";

/* Обьект содержащий все функции и переменные 
 * серверной части Cloud Commander'а
 */
var CloudServer         = {
    /* main Cloud Commander configuration
     * readed from config.json if it's
     * exist
     */
    Config          : {
        cache : {
            allowed : true
        },
        appcache  : false,
        minification : {
            js    : false,
            css   : false,
            html  : true,
            img   : false
        },
        server    : true,
        logs      : false,
        socket    : true,
        port      : 31337,
        ip        : '127.0.0.1'
    },
    
    /* функция, которая генерирует заголовки
     * файлов, отправляемые сервером клиенту
     */
    generateHeaders : function () {},
    
    /* функция высылает
     * данные клиенту
     */
    sendResponse    : function () {},

     /* Обьект для работы с кэшем */
    Cache           : {},
    
    /* Обьект через который
     * выполняеться сжатие
     * скриптов и стилей
     */
    
    Minify          : {},
    
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
    Gzip            : undefined,
    
    /* server varible */
    Server          :{},
    
    /* КОНСТАНТЫ */
    INDEX           : 'index.html',
    Extensions      :{
            '.css'      : 'text/css',
            '.js'       : 'text/javascript',
            '.png'      : 'image/png',
            '.json'     : 'application/json',
            '.html'     : 'text/html',
            '.woff'     : 'font/woff',
            '.appcache' : 'text/cache-manifest',
            '.mp3'      : 'audio/mpeg'
    }
},

    DirPath             = '/',

    DIR                 = process.cwd() + '/',
    LIBDIR              = DIR + 'lib/',
    SRVDIR              = LIBDIR + 'server/',

/* модуль для работы с путями*/
    Path                = require('path'),
    Fs                  = require('fs'),    /* модуль для работы с файловой системой*/
    Querystring         = require('querystring'),
    
    srvfunc             = require(SRVDIR + 'srvfunc'),

/* node v0.4 not contains zlib  */
    Zlib                = srvfunc.require('zlib');  /* модуль для сжатия данных gzip-ом*/
if(!Zlib)
    console.log('to use gzip-commpression' +
        'you should use newer node version\n');

 /* добавляем  модуль с функциями */
var CloudFunc           =   srvfunc.require(LIBDIR + 'cloudfunc'),
    Util                =   srvfunc.require(LIBDIR + 'util');

CloudServer.AppCache    =   srvfunc.require(SRVDIR + 'appcache');
CloudServer.Socket      =   srvfunc.require(SRVDIR + 'socket');
                                
CloudServer.Obj         =   srvfunc.require(SRVDIR + 'object');

if(CloudServer.Obj){
    CloudServer.Cache   =   CloudServer.Obj.Cache;                            
    CloudServer.Minify  =   CloudServer.Obj.Minify;
}
else
    console.log('could not found one of Cloud Commander SS files');

/* базовая инициализация  */
CloudServer.init        = (function(pAppCachProcessing){    
    /* Переменная в которой храниться кэш*/
    this.Cache.setAllowed(CloudServer.Config.cache.allowed);
    /* Change default parameters of
     * js/css/html minification
     */
    this.Minify.setAllowed(CloudServer.Config.minification);
    /* Если нужно минимизируем скрипты */
    this.Minify._allowed = this.Minify.doit();
    
    
    var lAppCache = CloudServer.AppCache;
    
    /* создаём файл app cache */    
    if( CloudServer.Config.appcache  &&
        lAppCache                   &&
        CloudServer.Config.server )
            Util.exec( pAppCachProcessing );
});


/**
 * Функция создаёт сервер
 * @param pConfig
 */
CloudServer.start = function (pConfig, pIndexProcessing, pAppCachProcessing) {    
    if(pConfig)
        this.Config = pConfig;
    else
        console.log('warning: configuretion file config.json not found...\n' +
            'using default values...\n'                     +
            JSON.stringify(this.Config));
        
    CloudServer.indexProcessing = pIndexProcessing;
    
    this.init(pAppCachProcessing);
    
    this.Port = process.env.PORT            ||  /* c9           */
                process.env.app_port        ||  /* nodester     */
                process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                this.Config.port;
    
    this.IP   = process.env.IP              ||  /* c9           */
                this.Config.ip;
    
    /* if Cloud Server started on jitsu */
    if(process.env.HOME &&
        !process.env.HOME.indexOf('/opt/haibu')) {
            this.IP = '0.0.0.0';
    }
    
    
    console.log(process.argv);

    /* server mode or testing mode */
    if (this.Config.server) {
        var http = require('http');

        try {
            this.Server =  http.createServer(this._controller);
            this.Server.listen(this.Port, this.IP);
            
            if(this.Config.socket && CloudServer.Socket){
                CloudServer.Socket.listen(this.Server);
                console.log('sockets running');                
            }
            else
                console.log('sockets disabled');
            
            console.log('Cloud Commander server running at http://' +
                this.IP + ':' + this.Port);
        }catch(pError){
            console.log('Cloud Commander server could not started');
            console.log(pError);
        }
    }else
        console.log('Cloud Commander testing mode');
};


/**
 * Функция создаёт заголовки файлов
 * в зависимости от расширения файла
 * перед отправкой их клиенту
 * @param pName - имя файла
 * @param pGzip - данные сжаты gzip'ом
 */
CloudServer.generateHeaders = function(pName, pGzip){
    var lType               = '',
        lCacheControl       = 0,
        lContentEncoding    = '',
        lRet,
        
        lDot                = pName.lastIndexOf('.'),
        lExt                = pName.substr(lDot);
    
    if( Util.strCmp(lExt, '.appcache') )
        lCacheControl = 1;
    
    lType = CloudServer.Extensions[lExt] || 'text/plain';
    
    if( !Util.isContainStr(lType, 'img') )
        lContentEncoding = '; charset=UTF-8';

    var lQuery = CloudServer.Queries[pName];
    console.log(lQuery);
    if(lQuery){
        if( Util.strCmp(lQuery, 'download') )
            lType = 'application/octet-stream';
        
        console.log(pName + lQuery);
    }

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
    
    console.log(lRet);
    
    return lRet;
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
    var url = require("url"),
        lParsedUrl = url.parse(pReq.url),
        pathname = lParsedUrl.pathname,
    
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
        console.log('query = ' + lQuery);
        
    /* added supporting of Russian language in directory names */
    pathname = Querystring.unescape(pathname);
    console.log('pathname: ' + pathname);
        
     /* получаем поддерживаемые браузером кодировки*/
     var lAcceptEncoding = pReq.headers['accept-encoding'];
    /* запоминаем поддерживает ли браузер
     * gzip-сжатие при каждом обращении к серверу
     * и доступен ли нам модуль zlib
     */ 
    if (lAcceptEncoding && 
        lAcceptEncoding.match(/\bgzip\b/) &&
        Zlib){
        CloudServer.Gzip = true;
    }
    /* путь в ссылке, который говорит
     * что js отключен
     */
    var lNoJS_s = CloudFunc.NOJS,
        lFS_s   = CloudFunc.FS;
    console.log("request for " + pathname + " received...");
    
    
    /* если в пути нет информации ни о ФС,
     * ни об отсутствии js,
     * ни о том, что это корневой
     * каталог - загружаем файлы проэкта
     */

         
    
    if ( !Util.isContainStr(pathname, lFS_s)    &&
         !Util.isContainStr(pathname, lNoJS_s)  &&
         !Util.strCmp(pathname, '/')            &&
         !Util.strCmp(lQuery, 'json') ) {
        /* если имена файлов проекта - загружаем их*/  
        /* убираем слеш и читаем файл с текущец директории*/
        
        /* добавляем текующий каталог к пути */
        var lName = '.' + pathname;
        console.log('reading '+lName);
        
        /* watching is file changed */
        if(CloudServer.Config.appcache)        
            CloudServer.AppCache.watch(lName);
        
        /* сохраняем указатель на response и имя */
        CloudServer.Responses[lName]    = pRes;
        
        /* saving status OK for current file */
        CloudServer.Statuses[lName]     = 200;
        
        /* Берём значение из кэша
         * сжатый файл - если gzip-поддерживаеться браузером
         * не сжатый - в обратном случае
         */
        var lFileData = CloudServer.Cache.get(
            CloudServer.Gzip?(lName+'_gzip') : lName);
        
        console.log(Path.basename(lName));
                    
        var lMinify = CloudServer.Minify;
        
        /* object thet contains information
         * about the source of file data
         */
        var lFromCache_o = {'cache': true};
        
        /* if cache is empty and Cache allowed and Minify_allowed 
         * and in Minifys cache is files, so save it to
         * CloudServer cache
         */
        if(!lFileData &&  
            lMinify._allowed){
                console.log('trying to read data from Minify.Cache');
                lFromCache_o.cache = false;
                lFileData = CloudServer.Minify.Cache[
                    Path.basename(lName)];                    
        }
        var lReadFileFunc_f = CloudServer.getReadFileFunc(lName),
        /* если там что-то есть передаём данные в функцию readFile */
            lResult = true;
        
        if(lFileData){
            /* if file readed not from cache - 
             * he readed from minified cache 
             */
            if(lFromCache_o.cache === false)
                lFromCache_o.minify = true;
            else
                lFromCache_o.minify = false;
                
            console.log(lName + ' readed from cache');
            /* передаём данные с кэша,
             * если gzip включен - сжатые
             * в обратном случае - несжатые
             */
            lReadFileFunc_f(undefined, lFileData, lFromCache_o);
        }
        /* if file not in one of caches
         * and minimizing setted then minimize it
         */
        else if(lName.indexOf('min') < 0 &&
            CloudServer.Minify){
                var lMin_o = CloudServer.Config.minification,
                
                    lCheck_f = function(pExt){
                        return CloudFunc.checkExtension(lName,pExt);
                    },

                    isAllowd_b = (lCheck_f('js') && lMin_o.js)   ||
                                 (lCheck_f('css') && lMin_o.css) ||                
                                 (lCheck_f('html') && lMin_o.html);
                    
                if(isAllowd_b){
                    lResult = CloudServer.Minify.optimize(lName, {
                        cache: true,
                        callback: function(pFileData){
                            lReadFileFunc_f(undefined, pFileData, false);
                        }
                    });
                }
                else 
                    lResult = false;
            } else
                lResult = false;
            
        if(!lResult)
            Fs.readFile(lName, lReadFileFunc_f);            
    }else{/* если мы имеем дело с файловой системой*/
        /* если путь не начинаеться с no-js - значит 
         * js включен
         */
        /* убираем пометку cloud, без которой c9.io
         * не работает поскольку путь из двух слешей
         * (/fs/no-js/) - очень короткий, нужно
         * длиннее
         */
        
        if(pathname.indexOf(lNoJS_s) !== lFS_s.length &&
            pathname !== '/'){
                CloudServer.NoJS = false;
                
        }else pathname = pathname.replace(lNoJS_s,'');
        
        /* убираем индекс файловой системы */
        if(pathname.indexOf(lFS_s) === 0){
            pathname = pathname.replace(lFS_s,'');
        
        /* if query json setted up
         * load json data, no-js false.
         */
        if(lQuery === 'json'){
            CloudServer.NoJS = false;
        }
        
        /* если посетитель только зашел на сайт
         * no-js будет пустым, как и fs.
         * Если в пути нету fs - посетитель только зашел на сайт
         * загружаем его полностью.
         */
        } else CloudServer.NoJS = true;
        /* если в итоге путь пустой
         * делаем его корневым
         */                         
        if (pathname === '')
            pathname = '/';
                    
        DirPath  = pathname;
        
        CloudServer.Responses[DirPath]  = pRes;
        
        CloudServer.Statuses[DirPath]   = 200;
        
        /* saving query of current file */
        CloudServer.Queries[DirPath]    = lQuery;
        console.log(lQuery);
        console.log(DirPath);
        
        /* читаем основные данные о файле */
        if( lQuery && lQuery.indexOf('code=') === 0){
            var lAuth = srvfunc.require(SRVDIR + 'auth');

            if(lAuth) lAuth.auth(lQuery, function(){
                    Fs.stat(DirPath, CloudServer._stated);
                });
            console.log('***********');
        }else            
            Fs.stat(DirPath, CloudServer._stated);
        
        /* если установлено сжатие
         * меняем название html-файла и
         * загружаем сжатый html-файл в дальнейшем
         */
        CloudServer.INDEX = (CloudServer.Minify._allowed.html ?
            '.' + CloudServer.Minify.MinFolder + 'index.min.html'
            : CloudServer.INDEX);
      
        /*
         * сохраним указатель на response
         * и на статус ответа
         */            
        CloudServer.Responses[CloudServer.INDEX] = pRes;
        CloudServer.Statuses [CloudServer.INDEX] = 200;
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
        CloudServer.sendResponse('OK',pError.toString(), DirPath);
        
        return;
    }

    /* 
     * если это каталог - 
     * читаем его содержимое
     */
             
    if(pStat){
        if(pStat.isDirectory())
            Fs.readdir(DirPath, CloudServer._readDir);                    
        /* отдаём файл */
        else if(pStat.isFile()){                        
            Fs.readFile(DirPath, CloudServer.getReadFileFunc(DirPath));
            console.log('reading file: '+DirPath);
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
        console.log(pError);
        
        CloudServer.Statuses[DirPath]  = 404;
        CloudServer.sendResponse('OK',pError.toString(), 
            DirPath);
        return;
    }
    
    /* Если мы не в корне добавляем слеш к будующим ссылкам */       
   if(DirPath !== '/')
    {
        DirPath += '/';
    }

    pFiles = pFiles.sort();
    
    var lCount = 0;
    var lStats = {};
    /* asyn getting file states
     * and putting it to lStats object
     */
    var getFilesStat_f = function(pName){
        return function(pError, pStat){
            var fReturnFalse = function(){
                return false;
            };
            
            if(pError)
                lStats[pName] = {
                    'mode':0,
                    'size':0,
                    'isDirectory':fReturnFalse
                };
                
            else
                lStats[pName] = pStat;
            
            /* if this file is last - moving next */
            if(++lCount === pFiles.length)
                CloudServer._fillJSON(lStats, pFiles);
        };
    };
    
    if(pFiles.length)
        for(var i = 0; i < pFiles.length; i++){
            /* Получаем информацию о файле*/
            Fs.stat(DirPath + pFiles[i],
                getFilesStat_f(pFiles[i]));
        }
    else CloudServer._fillJSON(null, pFiles);
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
        path:DirPath,
        size:'dir'
    };
    
    var fReturnFalse = function returnFalse(){return false;};
    
    for(var i = 0; i < pFiles.length; i++)
    {
        /*
         *Переводим права доступа в 8-ричную систему
         */
        var lName = pFiles[i],
        
            lMode = (pStats[lName].mode-0).toString(8),
            lStats = pStats[lName],
            lIsDir  = lStats.isDirectory();
        
        /* Если папка - выводим пиктограмму папки   *
         * В противоположном случае - файла         */
        lJSONFile = {'name':pFiles[i],
            'size'  : (lIsDir?'dir':lStats.size),
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
        lList       = '<ul id=left class=panel>';
        lList       += lPanel;
        lList       += '</ul>';
        
        lList       += '<ul id=right class="panel">';
        lList       += lPanel;
        lList       += '</ul>';
        
        /* пробуем достать данные из кэша
         * с жатием или без, взависимости
         * от настроек
         */
        var lFileData = CloudServer.Cache.get(CloudServer.INDEX);
        /* если их нет там - вычитываем из файла*/
        if(!lFileData) {
            Fs.readFile(CloudServer.INDEX,
                CloudServer.indexReaded(lList));
        }else {
            var lReaded_f = CloudServer.indexReaded(lList);
            lReaded_f(false, lFileData);
        }
    }else{
        /* в обычном режиме(когда js включен
         * высылаем json-структуру файлов
         * с соответствующими заголовками
         */
        lList   = JSON.stringify(lJSON);
        lHeader = CloudServer.generateHeaders('fs.json', CloudServer.Gzip);
        
        /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
        if(CloudServer.Gzip){
            Zlib.gzip(lList,CloudServer.getGzipDataFunc(lHeader,CloudServer.INDEX));
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
          return console.log(pError);
        }
                
        /* и сохраняем в кэш */
        CloudServer.Cache.set(CloudServer.INDEX, pIndex);
                
        pIndex = pIndex.toString();
        
        
        var lProccessed = Util.exec(function(){
            return CloudServer.indexProcessing(pIndex, pList);
        });
            if(lProccessed)
                pIndex = lProccessed;
        /* 
         * если браузер поддерживает gzip-сжатие
         * высылаем заголовок в зависимости от типа файла 
         */
        var lHeader = CloudServer.generateHeaders('index.html', CloudServer.Gzip);
        
         /* если браузер поддерживает gzip-сжатие - сжимаем данные*/                
        if(CloudServer.Gzip) {
            Zlib.gzip(pIndex,
                CloudServer.getGzipDataFunc(lHeader, CloudServer.INDEX));
        }
        
        /* если не поддерживаеться - отсылаем данные без сжатия*/
        else
            CloudServer.sendResponse(lHeader, pIndex, CloudServer.INDEX);
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
 * @pFromCache_o    - прочитано с файла,
 *                      или из одного из кешей
 * Пример {cache: false, minify: true}
 */    
    var lReadFile = function(pError, pData, pFromCache_o){
        if (!pError){
            console.log('file ' + pName + ' readed');
            
            /* берём из кэша данные файла
             * если их нет в кэше - 
             * сохраняем
             */            
            if(pFromCache_o && !pFromCache_o.cache && CloudServer.Cache.isAllowed)
                CloudServer.Cache.set(pName, pData);
            /* если кэш есть
             * сохраняем его в переменную
             * которая до этого будет пустая
             * по скольку мы будем вызывать этот метод
             * сами, ведь файл уже вычитан
             */            
            var lHeader = CloudServer.generateHeaders(pName, CloudServer.Gzip);
            
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if( CloudServer.Gzip && !(pFromCache_o && pFromCache_o.cache) ){
                /* сжимаем содержимое */
                Zlib.gzip(pData,CloudServer.getGzipDataFunc(lHeader, pName));                
            }
            else{
                /* высылаем несжатые данные */
                CloudServer.sendResponse(lHeader, pData, pName);
            }
        }
        else{
            console.log(pError.path);
            if(pError.path !== 'passwd.json')
            {
                console.log(pError);
                
                /* sending page not found */
                CloudServer.Statuses[pName] = 404;                
                CloudServer.sendResponse('file not found', pError.toString(), pName);
            }else
                CloudServer.sendResponse('OK', 'passwd.json');        
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
        if(!error){
            /* отправляем сжатые данные
             * вместе с заголовком                         
             * если установлена работа с кэшем
             * сохраняем сжатые данные
             */
            if(CloudServer.Cache.isAllowed){
                /* устанавливаем кєш */
                console.log(pName+' gziped');
                CloudServer.Cache.set(pName+'_gzip', pResult);
            }
            CloudServer.sendResponse(pHeader, pResult, pName);                        
        }
        else{
            console.log(error);
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
        
        console.log(pName + ' sended');
    }
};

exports.start = function(pConfig, pIndexProcessing, pAppCachProcessing){
    CloudServer.start(pConfig, pIndexProcessing, pAppCachProcessing);
};
exports.CloudServer = CloudServer;