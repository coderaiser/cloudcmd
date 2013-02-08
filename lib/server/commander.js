(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# commander.js'                                   + '\n'  +
            '# -----------'                                    + '\n'  +
            '# Module is part of Cloud Commander,'             + '\n'  +
            '# used for getting dir content.'                  + '\n'  +
            '# and forming html content'                       + '\n'  +
            '# http://coderaiser.github.com/cloudcmd'          + '\n');
            
    var main                = global.cloudcmd.main,
        fs                  = main.fs,
        CloudFunc           = main.cloudfunc,
        DIR                 = main.DIR,
        LIBDIR              = main.LIBDIR,
        HTMLDIR             = main.HTMLDIR,
        Util                = main.util,
        url                 = main.url,
        querystring         = main.querystring,
        zlib                = main.zlib,
        
        FILE_NOT_FOUND      = 404,
        OK                  = 200,
        
        FS                  = CloudFunc.FS,
        NO_JS               = CloudFunc.NOJS,
        
        INDEX               = null,
        REQUEST             = 'request',
        RESPONSE            = 'response',
        
        IndexProcessingFunc = null;
    
    
    exports.sendContent = function(pParams){
        var lRet = Util.checkObj(pParams,
            ['processing'],
            [REQUEST, RESPONSE, 'index']);
        
        if(lRet){
            var p       = pParams,
                lPath   = getCleanPath(p.request);
            
            INDEX   = p.index;
            IndexProcessingFunc = pParams.processing;
            
            fs.stat(lPath, function(pError, pStat){
                if(!pError)
                    if(pStat.isDirectory())
                        fs.readdir(lPath, Util.call(readDir, pParams) );
                    else 
                        main.sendFile({
                            name        : lPath,
                            request     : p.request,
                            response    : p.response
                        });
                else
                    sendResponse({
                        name        : lPath,
                        status      : FILE_NOT_FOUND,
                        data        : pError.toString(),
                        request     : p.request,
                        response    : p.response
                    });
            });
            
            lRet = true;
        }
        
        return lRet;
    };
    
    
    /**
     * Функция читает ссылку или выводит информацию об ошибке
     * @param pError
     * @param pFiles
     */
    function readDir(pParams){
        var lRet = checkParams(pParams);
        
        if(lRet)
            lRet = Util.checkObjTrue(pParams.params,
                    [REQUEST, RESPONSE]);
        if(lRet){
            var p           = pParams,
                c           = p.params,
                lFiles      = p.data,
                lDirPath    = getDirPath(c.request);
                        
            if(!p.error && lFiles){
                lFiles.data = lFiles.sort();
                
                /* Получаем информацию о файлах */
                var n           = lFiles.length,
                    lStats      = {},
                    lFilesData  = {
                        files       : lFiles,
                        stats       : lStats,
                        request     : c.request,
                        response    : c.response
                    },
                    
                    lFill   = function(){
                        fillJSON(lFilesData);
                    };
                
                if(n){
                    for(var i = 0; i < n; i++){
                        var lName = lDirPath + lFiles[i],
                            lParams =  {
                                callback    : lFill,
                                count       : n,
                                name        : lFiles[i],
                                stats       : lStats,
                            };
                        
                        fs.stat( lName, Util.call(getFilesStat, lParams) );
                    }
                }
                else
                    fillJSON(lFilesData);
            }
            else
                sendResponse({
                    data    : p.Error.toString(),
                    name    : lDirPath,
                    request : c.request,
                    response: c.response,
                    status  : FILE_NOT_FOUND
                });
        }
    }
    
    /**
     * async getting file states
     * and putting it to lStats object
     */
    function getFilesStat(pParams){
        var lRet = checkParams(pParams);
        
        if(lRet)
            lRet = Util.checkObj(pParams.params,
                ['callback'], ['stats', 'name', 'count']);
        
        if(lRet){
            var p = pParams,
                c = p.params;
            
            if(c.stats)
                c.stats[c.name] = !p.error ? p.data   : {
                    'mode'          : 0,
                    'size'          : 0,
                    'isDirectory'   : Util.retFalse
                };
            
            if(c.count === Object.keys(c.stats).length)
                Util.exec(c.callback);
        }
    }
    
    /**
     * Function fill JSON by file stats
     *
     * @param pStats - object, contain file stats.
     *          example {'1.txt': stat}
     *
     * @param pFiles - array of files of current directory
     */
    function fillJSON(pParams){
        var lFiles, lAllStats,
            i, n, lReq, lRes;
        
        if(pParams){
            lFiles      = pParams.files;
            lFiles &&(n = lFiles.length || 0);
            lAllStats   = pParams.stats;
            lReq        = pParams.request,
            lRes        = pParams.response;
        }
        /* данные о файлах в формате JSON*/
        var lJSON       = [],
            lJSONFile   = {},
            lList,
            lDirPath    = getDirPath(lReq);
        
        lJSON[0]        = {
            path    : lDirPath,
            size    : 'dir'
        };
        
        var lName, lStats, lMode, lIsDir;
        for( i = 0; i < n; i++ ){
            /* Переводим права доступа в 8-ричную систему */
            lName   = lFiles[i],
            lStats  = lAllStats[lName];
            
            if(lStats){
                lMode   = (lStats.mode - 0).toString(8),
                lIsDir  = lStats.isDirectory();
            }
            
            /* Если папка - выводим пиктограмму папки   *
             * В противоположном случае - файла         */
            lJSONFile = {
                'name'  : lFiles[i],
                'size'  : lIsDir ? 'dir' : lStats.size,
                'uid'   : lStats.uid,
                'mode'  : lMode
            };
            
            lJSON[i+1] = lJSONFile;
        }
        
        /* если js недоступен
         * или отключен выcылаем html-код
         * и прописываем соответствующие заголовки
         */    
        if( noJS(lReq) ){
            var lPanel  = CloudFunc.buildFromJSON(lJSON);
            lList       = '<ul id=left class=panel>'  + lPanel + '</ul>' +
                          '<ul id=right class=panel>' + lPanel + '</ul>';
            
            fs.readFile(INDEX, Util.call(readFile, {
                    list     : lList,
                    request  : lReq,
                    response : lRes
                })
            );
            
        }else{
            lDirPath = lDirPath.substr(lDirPath, lDirPath.lastIndexOf('/') );
            
            /* в обычном режиме(когда js включен
             * высылаем json-структуру файлов
             * с соответствующими заголовками
             */
            lList   = JSON.stringify(lJSON);
            
            sendResponse({
                name    : lDirPath + '.json',
                data    : lList,
                request : lReq,
                response: lRes
            });
            
        }
    }
    
    
    /** 
     * Функция генерирует функцию считывания файла
     * таким образом, что бы у нас было
     * имя считываемого файла
     * @param pName - полное имя файла
     */
    function readFile(pParams){
        var lRet = checkParams(pParams);
        
        if(lRet)
            lRet = Util.checkObjTrue(pParams.params, 
                [REQUEST, RESPONSE, 'list']);
        
        if(lRet){
            var p           = pParams,
                c           = pParams.params;
            
            p.data = p.data.toString();
            
            var lParams     = {
                    name        : INDEX,
                    request     : c.request,
                    response    : c.response,
                },
                
                lProccessed = Util.exec(IndexProcessingFunc, {
                    additional  : c.list,
                    data        : p.data,
                });
            
            if(lProccessed)
                p.data = lProccessed;
            
            if (!p.Error){
                lParams.data      = p.data;
                Util.log('file ' + c.name + ' readed');
            }
            else{
                lParams.status    = FILE_NOT_FOUND;
                lParams.data      = p.error.toString();
            }
                
            sendResponse(lParams);
        }
    }
          /**
     * Функция высылает ответ серверу
     * @param pHead     - заголовок
     * @param Data      - данные
     * @param pName     - имя отсылаемого файла
     */
    function sendResponse(pParams){
         var lRet = Util.checkObjTrue(pParams,
            ['name', 'data', REQUEST, RESPONSE]);
        
        if(lRet){
            var p = pParams;
            
            var lPath       = p.name || getCleanPath(p.request),
                lQuery      = main.getQuery(p.request),
                /* download, json */
                lGzip       = isGZIP(p.request),
                lHead       = main.generateHeaders(lPath, lGzip, lQuery);
            
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            Util.ifExec(!lGzip,
                function(pParams){
                    var lRet = Util.checkObj(pParams, ['data']);
                    
                    if(lRet){
                        p.status    = pParams.status || p.status;
                        p.data      = pParams.data;
                    }
                    
                    p.response.writeHead(p.status || OK, lHead);
                    p.response.end(p.data);
                    
                    Util.log(lPath + ' sended');
                    Util.log( p.status === FILE_NOT_FOUND && p.data );
                },
                
                function(pCallBack){
                    zlib.gzip (p.data, Util.call(gzipData, {
                        callback    : pCallBack
                    }));
                });
        }
    }
    
       /**
     * Функция получает сжатые данные
     * @param pHeader - заголовок файла
     * @pName
     */
    function gzipData(pParams){
        var lRet = checkParams(pParams);
        
        if(lRet)
            lRet = Util.checkObj(pParams.params, ['callback']);
        
        if(lRet){
            var p           = pParams,
                c           = pParams.params,
                lParams       = {};
            
            if(!p.error)
                lParams.data      = p.data;
            else{
                lParams.status    = FILE_NOT_FOUND;
                lParams.data      = p.error.toString();
            }
            
            Util.exec(c.callback, lParams);
        }
    }
    
    
    function checkParams(pParams){
        return Util.checkObj(pParams, ['error', 'data', 'params']);
    }
    
    function getPath(pReq){
        var lParsedUrl  = url.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        lPath           = querystring.unescape(lPath);
        return lPath;
    }
    
    
    function getCleanPath(pReq){
        var lPath = getPath(pReq),
            lRet = Util.removeStr(lPath, [NO_JS, FS]) || main.SLASH;
        
        return lRet;
    }
    
    function getDirPath(pReq){
        var lRet = getCleanPath(pReq);
        
        if(lRet !== '/')
            lRet += '/';
        
        return lRet;
    }
    
    function noJS(pReq){
        var lNoJS, lPath;
        
        if(pReq){
            lPath = getPath(pReq);
            
            lNoJS = Util.isContainStr(lPath, NO_JS)
                || lPath === '/' || main.getQuery() == 'json';
        }
        
        return lNoJS;
    }
    
    function isGZIP(pReq){
        var lEnc, lGZIP;
        if(pReq){
            lEnc        = pReq.headers['accept-encoding'] || '',
            lGZIP       = lEnc.match(/\bgzip\b/);
        }
        
        return lGZIP;
    }
    
})();