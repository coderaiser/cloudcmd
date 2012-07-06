"use strict";

/* Обьект содержащий все функции и переменные 
 * серверной части Cloud Commander'а
 */
var CloudServer={
    /* main Cloud Commander configuration
     * readed from config.json if it's
     * exist
     */
    Config      : {
                    "cache" : {"allowed" : true},
                    "minification" : {
                        "js"    : false,
                        "css"   : false,
                        "html"  : true,
                        "img"   : false
                    },
                    "server"    : true
    },
    /* функция, которая генерирует заголовки
     * файлов, отправляемые сервером клиенту
     */
    generateHeaders :function(){},
    /* функция высылает
     * данные клиенту
     */
    sendResponse        :function(){},
    /* Структура содержащая функции,
     * и переменные, в которых
     * говориться о поддерживаемых
     * браузером технологиях
     */
    BrowserSuport   :{},
     /* Обьект для работы с кэшем */
    Cashe                   :{},
    /* Обьект через который
     * выполняеться сжатие
     * скриптов и стилей
     */
    Minify                  :{},
    /* Асоциативный масив обьектов для
     * работы с ответами сервера
     * высылаемыми на запрос о файле и
     * хранащий информацию в виде
     * Responces[name]=responce;
     */
    Responses               :{},
    
    /* ПЕРЕМЕННЫЕ */
    /* Поддержка браузером JS*/
    NoJS            :true,    
    /* Поддержка gzip-сжатия
     * браузером
     */
    Gzip            :undefined,
    
    /* КОНСТАНТЫ */
    /* index.html */
    INDEX           :'index.html',
    /* name of direcotory with libs */
    LIBDIR          :'./lib',
    LIBDIRSERVER    :'./lib/server',
    
    Port            :31337, /* server port */
    IP              :'127.0.0.1'    
};

/* 
 * Обьект для работы с кэшем
 * аналог клиентского обьекта
 * с тем отличием, что в нём
 * будут храниться серверные
 * данные, такие как файлы
 * отдаваемые клиенту
 * (файлы проэкта по большому
 * счёту, для ускорения
 * первичной загрузки)
 */
CloudServer.Cache={
    _allowed            :true,     /* приватный переключатель возможности работы с кэшем */
    /* данные в которых храняться файлы 
     * в формате <поле> : <значение>
     * _data[name]=pData;
     * одному имени соответствуют 
     * одни данные
     */
    _data               :{},
    
    /* функция говорит можно ли работать с кэшем */
    isAllowed           :(function(){
        return CloudServer.Cache._allowed;
        }),
    /* функция устанавливает возможность работать с кэшем */
    setAllowed          :(function(pAllowed){
       CloudServer.Cache._allowed=pAllowed;
    }),
    /* Если доступен кэш
     * сохраняем в него данные
     */
    set                  :(function(pName, pData){
        if(CloudServer.Cache._allowed && pName && pData){
           CloudServer.Cache._data[pName]=pData;
        }
    }),
    /* Если доступен Cache принимаем из него данные*/
    get                 :(function(pName){
        if(CloudServer.Cache._allowed && pName){
            return CloudServer.Cache._data[pName];
        }
        else return null;
    }),
    
    /* Функция очищает кэш*/
    clear               :(function(){
        if(CloudServer.Cache._allowed){
            CloudServer.Cache._data={};
        }
    })
};

/* Обьект для сжатия скриптов и стилей
 * по умолчанию - сжимаються
 */
CloudServer.Minify={
    /* приватный переключатель минимизации */
    _allowed               :{css:true,js:true,html:true, img: true},
    
    /* функция разрешает или 
     * запрещает минимизировать
     * css/js/html
     * @pAllowed: - структура, в которой
     *              передаються параметры
     *              минификации, вида
     *              {js:true,css:true,html:false; img:true}
     * img отвечает за перевод картинок в base64
     * и сохранение их в css-файл
     */
    setAllowed              :(function(pAllowed){
       if(pAllowed){
           this._allowed.css=pAllowed.css; 
           this._allowed.js=pAllowed.js; 
           this._allowed.html=pAllowed.html; 
           this._allowed.img=pAllowed.img; 
       }
    }),
        
    /*
     * Функция минимизирует css/js/html
     * если установлены параметры минимизации
     */
    doit                    :(function(){
        if(this._allowed.css ||
            this._allowed.js ||
            this._allowed.html){
                var lMinify      = require(CloudServer.LIBDIRSERVER+'/minify');

                this.done.js=this._allowed.js?lMinify.jsScripts(['client.js',
                                                                'lib/cloudfunc.js',
                                                                'lib/client/keyBinding.js'])                                                                
                                                                :false;
                                                                
                this.done.html=this._allowed.html?lMinify.html():false;
                this.done.css=this._allowed.css?lMinify.cssStyles(this._allowed.img):false;
                                
                this.MinFolder=lMinify.MinFolder;                
        }
    }),
    /* свойство показывающее случилась ли ошибка*/
    done:{js: false,css: false, html:false},
    
    /* minification folder name */
    MinFolder:''
};


var LeftDir='/';
var RightDir=LeftDir;
/* модуль для работы с путями*/
var Path    = require('path');

var Fs          = require('fs');    /* модуль для работы с файловой системой*/

var Zlib;
/* node v0.4 not contains zlib 
 */
try{
    Zlib        = require('zlib');  /* модуль для сжатия данных gzip-ом*/
}catch(error){
    Zlib=undefined;
    console.log('to use gzip-commpression' +
        'you should install zlib module\n' +
        'npm install zlib');
}
var CloudFunc   = require(CloudServer.LIBDIR + 
                (CloudServer.Minify.done.js?/* если стоит минификация*/
                    '/cloudfunc.min':/* добавляем сжатый - иначе обычный */
                    '/cloudfunc'));  /* модуль с функциями */
/* конструктор*/
CloudServer.init=(function(){
    /* Determining server.js directory
     * and chang current process directory
     * (usually /) to it.
     * argv[1] - is always script name
     */
    var lServerDir = Path.dirname(process.argv[1]);
    console.log('current dir: ' + process.cwd());
    console.log('server dir:  ' + lServerDir);    
    process.chdir(lServerDir);
    
    try{
        console.log('reading configureation file config.json...');
        CloudServer.Config = require('./config');
        console.log('config.json readed');
        /* if command line parameter testing resolved 
         * setting config to testing
         */
        if(process.argv[1]==='testing')CloudServer.Config.server=false;
    }catch(pError){
        console.log('warning: configureation file config.json not found...\n'   +
                    'using default values...\n'                     +
                    JSON.stringify(CloudServer.Config));
    }        
    
    /* Переменная в которой храниться кэш*/
    CloudServer.Cache.setAllowed(CloudServer.Config.cache.allowed);
    /* Change default parameters of
     * js/css/html minification
     */
    CloudServer.Minify.setAllowed(CloudServer.Config.minification);
    /* Если нужно минимизируем скрипты */
    CloudServer.Minify.doit();        
});


/* создаём сервер на порту 31337 */
CloudServer.start=function()
{
    CloudServer.init();
    
    /* constant ports of deployng servers 
        var lCloudFoundryPort   = process.env.VCAP_APP_PORT;
        var lNodesterPort       = process.env.app_port;
        var lC9Port             = process.env.PORT;
    */
    CloudServer.Port = process.env.PORT            ||  /* c9           */
                       process.env.app_port        ||  /* nodester     */
                       process.env.VCAP_APP_PORT   ||  /* cloudfoundry */
                       CloudServer.Port;
                     
    CloudServer.IP   = process.env.IP             ||  /* c9           */
                       CloudServer.IP;
        
    /* server mode or testing mode */
    if(CloudServer.Config.server){
        var http = require('http');
        try{
            http.createServer(CloudServer._controller).listen(
                CloudServer.Port,
                CloudServer.IP);
                
            console.log('Cloud Commander server running at http://' +
                CloudServer.IP +
                ':' + 
                CloudServer.Port);
        }catch(pError){
            console.log('Cloud Commander server could not started');
            console.log(pError);
        }
    }else{
        console.log('Cloud Commander testing mode');
    }
    /*
        (!lC9Port?
            (!lCloudFoundryPort?
                (!lNodesterPort?31337:lNodesterPort)
            :lCloudFoundryPort)
        :lC9Port));
    */
};


/* Функция создаёт заголовки файлов
 * в зависимости от расширения файла
 * перед отправкой их клиенту
 * @pName - имя файла
 * @pGzip - данные сжаты gzip'ом
 */
CloudServer.generateHeaders = function(pName, pGzip){
    var lType='';
    /* высылаем заголовок в зависимости от типа файла */
    /* если расширение у файла css -
     * загружаем стили
     */
    if(CloudFunc.checkExtension(pName,'css'))
        lType='text/css';
    /* загружаем js */
    else if(CloudFunc.checkExtension(pName,'js'))
        lType='text/javascript';
    /* загружаем картинки*/
    else if(CloudFunc.checkExtension(pName,'png'))
        lType='image/png';
    /* загружаем json*/
    else if(CloudFunc.checkExtension(pName,'json'))
        lType='application/json';
    else if(CloudFunc.checkExtension(pName,'html'))
        lType='text/html';        
    else if(CloudFunc.checkExtension(pName,'appcache'))
        lType='text/cache-manifest';        
    /* если это неизвестный тип файла - 
     * высылаем его просто как текст
     */
    else lType='text/plain';
        
    return {
        /* if type of file any, but img - 
         * then we shoud specify charset 
         */
        'Content-Type': lType + (lType.indexOf('img')<0?'; charset=UTF-8':''),
        'cache-control': 'max-age='+(31337*21),
        'last-modified': new Date().toString(),
        'content-encoding': pGzip?'gzip':'',
        /* https://developers.google.com/speed/docs/best-practices/caching?hl=ru#LeverageProxyCaching */
        'Vary': 'Accept-Encoding'
    };
};

/*
 * Главная функция, через которую проихсодит
 * взаимодействие, обмен данными с клиентом
 * @req - запрос клиента (Request)
 * @res - ответ сервера (Response)
 */
CloudServer._controller=function(pReq, pRes)
{
    /* Читаем содержимое папки,
        переданное в url
    */
    var url = require("url");
    var pathname = url.parse(pReq.url).pathname;
    console.log('pathname: '+pathname);
    
     /* получаем поддерживаемые браузером кодировки*/
     var lAcceptEncoding = pReq.headers['accept-encoding'];
    /* запоминаем поддерживает ли браузер
     * gzip-сжатие при каждом обращении к серверу
     * и доступен ли нам модуль zlib
     */ 
    if (lAcceptEncoding && 
        lAcceptEncoding.match(/\bgzip\b/) &&
        Zlib){
        CloudServer.Gzip=true;
    }else 
        CloudServer.Gzip=false;
    /* путь в ссылке, который говорит
     * что js отключен
     */
    var lNoJS_s=CloudFunc.NOJS;
    var lFS_s=CloudFunc.FS;
    
    if(pathname!=='/favicon.ico')
    {    
        console.log("request for " + pathname + " received...");
        var lName;
                        
        /* если в пути нет информации ни о ФС,
         * ни об отсутствии js,
         * ни о том, что это корневой
         * каталог - загружаем файлы проэкта
         */
        if(pathname.indexOf(lFS_s)<0 &&
            pathname.indexOf(lNoJS_s)<0 &&
            pathname!=='/'){
            /* если имена файлов проекта - загружаем их*/  
            /* убираем слеш и читаем файл с текущец директории*/
            //lName=Path.basename(pathname);
            
            /* добавляем текующий каталог к пути */
            lName='.'+pathname;
            console.log('reading '+lName);
            /* сохраняем указатель на responce и имя */
            CloudServer.Responses[lName]=pRes;
            
            /* Берём значение из кэша
             * сжатый файл - если gzip-поддерживаеться браузером
             * не сжатый - в обратном случае
             */
            var lFileData=CloudServer.Cache.get(CloudServer.Gzip?(lName+'_gzip'):lName);

            var lReadFileFunc_f=CloudServer.getReadFileFunc(lName);
            /* если там что-то есть передаём данные в функцию
             * readFile
             */
            if(lFileData){
                console.log('readed from cache');
                /* передаём данные с кэша,
                 * если gzip включен - сжатые
                 * в обратном случае - несжатые
                 */
                lReadFileFunc_f(undefined,lFileData,true);
            }
            else Fs.readFile(lName,lReadFileFunc_f);
            
        }else{/* если мы имеем дело с файловой системой*/
            /* если путь не начинаеться с no-js - значит 
             * js включен
             */
            /* убираем пометку cloud, без которой c9.io
             * не работает поскольку путь из двух слешей
             * (/fs/no-js/) - очень короткий, нужно
             * длиннее
             */
            
            if(pathname.indexOf(lNoJS_s)!==lFS_s.length && pathname!=='/'){
                CloudServer.NoJS=false;
            }else pathname=pathname.replace(lNoJS_s,'');
            
            /* убираем индекс файловой системы */
            if(pathname.indexOf(lFS_s)===0){
                pathname=pathname.replace(lFS_s,'');
                /* если посетитель только зашел на сайт
                 * no-js будет пустым, как и fs
                 */                       
            /* если в пути нету fs - посетитель только зашел на сайт
             * загружаем его полностью.
             */
            }else CloudServer.NoJS=true;
            /* если в итоге путь пустой
             * делаем его корневым
             */                         
            if(pathname==='')pathname='/';
            
            RightDir=pathname;
            LeftDir=pathname;
            
            /* если встретиться пробел - 
             * меня код символа пробела на пробел
             */
            
            LeftDir=CloudFunc.replaceSpaces(LeftDir);
            RightDir=CloudFunc.replaceSpaces(RightDir);
            
            /* Проверяем с папкой ли мы имеем дело */
            
            /* читаем сновные данные о файле */
            var lStat;
            try{
                lStat=Fs.statSync(LeftDir);
            }catch(error){
                console.log(error);
                CloudServer.Responses[LeftDir]=pRes;
                CloudServer.sendResponse('OK',error.toString(),LeftDir);
            }
            /* если это каталог - 
             * читаем его содержимое
             */
            try{                    
                /* если установлено сжатие
                 * меняем название html-файла и
                 * загружаем сжатый html-файл в дальнейшем
                 */
                CloudServer.INDEX=(CloudServer.Minify.done.html?
                    CloudServer.Minify.MinFolder+'index.min.html'
                    :CloudServer.INDEX);
                /*
                 * сохраним указатель на response
                 */            
                CloudServer.Responses[CloudServer.INDEX]=pRes;
                
                if(lStat.isDirectory())                    
                    Fs.readdir(LeftDir,CloudServer._readDir);
                /* отдаём файл */
                else if(lStat.isFile()){
                    CloudServer.Responses[LeftDir]=pRes;
                    Fs.readFile(LeftDir,CloudServer.getReadFileFunc(LeftDir));
                    console.log('reading file: '+LeftDir);
                }
            }catch(error){console.log(error);}
        }
    }
};

/* Функция читает ссылку или выводит информацию об ошибке*/
CloudServer._readDir=function (pError, pFiles)
{
    if(!pError)
    {
        /* данные о файлах в формате JSON*/
        var lJSON=[];
        var lJSONFile={};
        /* Если мы не в корне добавляем слеш к будующим ссылкам */       
       if(LeftDir!=='/')
        {
            RightDir+='/';
            LeftDir+='/';
        }

        pFiles=pFiles.sort();
                
        lJSON[0]={path:LeftDir,size:'dir'};
        var fReturnFalse=function returnFalse(){return false;};        
        for(var i=0;i<pFiles.length;i++)
        {
            /* Получаем информацию о файле*/
            var lStats;
            try{
                lStats=Fs.statSync(RightDir+pFiles[i]);
            }catch(err){
                /*
                    console.log(err);
                */
                lStats={
                    'mode':0,
                    'size':0,
                    'isDirectory':fReturnFalse
                };
            }
            /*
             *Переводим права доступа в 8-ричную систему
             */
            var lMode=(lStats.mode-0).toString(8);            
                        
            /* Если папка - выводим пиктограмму папки */
            if(lStats.isDirectory())
            {                
                lJSONFile={'name':pFiles[i],'size':'dir','uid':lStats.uid,'mode':lMode};
                lJSON[i+1]=lJSONFile;            
            }
            /* В противоположном случае - файла */
            else
            {
                lJSONFile={'name':pFiles[i],'uid':lStats.uid,'size':lStats.size,'mode':lMode};
                lJSON[i+1]=lJSONFile;
            }
        }
        
        /* заголовок ответа сервера */        
        var lHeader;        
        var lList;
        /* если js недоступен */
        /* если javascript отключен вылылаем html-код
         * и прописываем соответствующие заголовки
         */
        
        if(CloudServer.NoJS){
            var lPanel=CloudFunc.buildFromJSON(lJSON);
            lList='<ul id=left class=panel>';
            lList+=lPanel;
            lList+='</ul>';
            
            lList+='<ul id=right class="panel hidden">';
            lList+=lPanel;
            lList+='</ul>';
            try{
                var lIndex;
                /* пробуем достать данные из кэша
                 * с жатием или без, взависимости
                 * от настроек
                 */
                var lFileData=CloudServer.Cache.get(CloudServer.INDEX);
                /* если их нет там - вычитываем из файла*/
                if(!lFileData){
                    lIndex=Fs.readFileSync(CloudServer.INDEX);
                    /* и сохраняем в кэш */
                    CloudServer.Cache.set(CloudServer.INDEX,lIndex);
                }else lIndex=lFileData;
                
                /* если выбрана опция минифизировать скрпиты
                 * меняем в index.html обычный client.js на
                 * минифицированый
                 */
                lIndex=lIndex.toString();
                
                /* if scripts shoud be minified and
                 * minification proceed sucessfully
                 * we include minified version of
                 * clien.js to index.html
                 */
                lIndex = CloudServer.Minify.done.css?
                    lIndex.replace('<link rel=stylesheet href="/css/reset.css">','')
                        .replace('/css/style.css',CloudServer.Minify.MinFolder + 'all.min.css')
                    :lIndex;
                      
                lIndex = CloudServer.Minify.done.js?lIndex.replace('client.js',
                    CloudServer.Minify.MinFolder + 
                        'client.min.js')
                    :lIndex;
                
                lIndex=lIndex.toString().replace('<div id=fm class=no-js>','<div id=fm class=no-js>'+lList);
                /* меняем title */
                lIndex=lIndex.replace('<title>Cloud Commander</title>',
                    '<title>'+CloudFunc.setTitle()+'</title>');
                /* отображаем панель быстрых клавишь */
                lList=lIndex;
                 /* если браузер поддерживает gzip-сжатие*/
                lHeader=CloudServer.generateHeaders('text/html',CloudServer.Gzip);
            }catch(error){console.log(error);}
        }else{
            /* в обычном режиме(когда js включен
             * высылаем json-структуру файлов
             * с соответствующими заголовками
             */
            lList=JSON.stringify(lJSON);
            lHeader=CloudServer.generateHeaders('application/json',CloudServer.Gzip);
        }
        /* если браузер поддерживает gzip-сжатие - сжимаем данные*/                
        if(CloudServer.Gzip){
            Zlib.gzip(lList,CloudServer.getGzipDataFunc(lHeader,CloudServer.INDEX));
        }
        /* если не поддерживаеться - отсылаем данные без сжатия*/
        else
            CloudServer.sendResponse(lHeader,lList,CloudServer.INDEX);
    }
    else
    {
        console.log(pError);
        CloudServer.sendResponse('OK',pError.toString());
    }
};

/* Функция генерирует функция считывания файла
 * таким образом, что бы у нас было 
 * имя считываемого файла
 * @pName - полное имя файла
 */
CloudServer.getReadFileFunc = function(pName){
/*
 * @pError  - ошибка
 * @pData   - данные
 * @pFromFile - прочитано с файла bool
 */    
    var lReadFile=function(pError,pData,pFromCache_b){
        if (!pError){
            console.log('file ' + pName + ' readed');
            
            /* берём из кэша данные файла
             * если их нет в кэше - 
             * сохраняем
             */            
            if(!pFromCache_b && CloudServer.Cache.isAllowed)
                CloudServer.Cache.set(pName,pData);
            /* если кэш есть
             * сохраняем его в переменную
             * которая до этого будет пустая
             * по скольку мы будем вызывать этот метод
             * сами, ведь файл уже вычитан
             */
            
            var lHeader=CloudServer.generateHeaders(pName,CloudServer.Gzip);
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if(CloudServer.Gzip &&!pFromCache_b){
                /* сжимаем содержимое */
                Zlib.gzip(pData,CloudServer.getGzipDataFunc(lHeader,pName));                
            }
            else{
                /* высылаем несжатые данные */
                CloudServer.sendResponse(lHeader,pData,pName);
            }
        }
        else
        {
            console.log(pError.path);
            if(pError.path!=='passwd.json')
            {
                console.log(pError);
                CloudServer.sendResponse('OK',pError.toString(),pName);
            }else{
                CloudServer.sendResponse('OK','passwd.json');
            }            
        }
    };
    return lReadFile;
};

/* Функция получает сжатые данные
 * @pHeader - заголовок файла
 */
CloudServer.getGzipDataFunc=function(pHeader,pName){
    return function(error,pResult){
                    if(!error){
                        /* отправляем сжатые данные
                         * вместе с заголовком
                         */                            
                         /* если установлена работа с кэшем
                          * сохраняем сжатые данные
                          */
                        if(CloudServer.Cache.isAllowed){
                            /* устанавливаем кєш */
                            console.log(pName+' gziped');
                            CloudServer.Cache.set(pName+'_gzip',pResult);
                        }
                        CloudServer.sendResponse(pHeader,pResult,pName);                        
                    }
                    else{
                        console.log(error);
                        CloudServer.sendResponse(pHeader,error);
                    }
    };
};
/* Функция высылает ответ серверу 
 * @pHead       - заголовок
 * @pData       - данные
 * @pName       - имя отсылаемого файла
 */
CloudServer.sendResponse = function(pHead, pData,pName){
    /* если у нас есть указатель на responce
     * для соответствующего файла - 
     * высылаем его
     */
    var lResponse=CloudServer.Responses[pName];
    if(lResponse){
        lResponse.writeHead(200,pHead);
        lResponse.end(pData);
        console.log(pName+' sended');
    }
};

CloudServer.start();