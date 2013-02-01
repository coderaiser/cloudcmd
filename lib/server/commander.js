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
        zlib                = main.zlib,
        url                 = main.url,
        CloudFunc           = main.cloudfunc,
        DIR                 = main.DIR,
        LIBDIR              = main.LIBDIR,
        HTMLDIR             = main.HTMLDIR,
        Util                = main.util,
        
        NOT_FOUND           = 404,
        OK                  = 200,
        
        NO_JS               = CloudFunc.NoJS,
        FS                  = CloudFunc.Fs,
        INDEX               = HTMLDIR + 'index.html';
    
    
    exports.sendContent = function(pParams){
        var lRet,
            lReq, lRes;
        
        if(pParams){
            lReq    = pParams.request,
            lRes    = pParams.response;
        }
        
        if(lReq && lRes){
            var lPath = getCleanPath(lReq);
            
            fs.stat(lPath, function(pError, pStat){
                if(!pError)
                    if(pStat.isDirectory())
                        fs.readdir(lPath, call(readDir, pParams) );
                    else 
                        fs.readFile(lPath, getReadFileFunc(lPath));
                else
                    sendResponse({
                        status  : NOT_FOUND,
                        data    : pError.toString(),
                        request : lReq,
                        response: lRes
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
        var lRet,
            lError, lFiles, lHTTP,
            lReq, lRes;
        
        if(pParams){
            lError  = pParams.error;
            lFiles  = pParams.data;
            lHTTP   = pParams.params;
            
            if(lHTTP){
                lReq    = lHTTP.request,
                lRes    = lHTTP.response;
                lRet    = true;
            }
        }
        
        if(lRet && !lError && lFiles){
            lFiles = lFiles.sort();
            
            /* Получаем информацию о файлах */
            var n       = lFiles.length,
                lStats  = {},
                lFill   = function(){
                    fillJSON(lStats, lFiles);
                };
            
            if(n){
                var i, lDirPath = getDirPath(lReq);
                
                for(i = 0; i < n; i++){
                    var lName = lDirPath + lFiles[i],
                        lParams =  {
                            name        : lFiles[i],
                            callback    : i == n-1 ? lFill : null,
                            stats       : lStats,
                        };
                    
                    fs.stat( lName, call(getFilesStat, lParams) );
                }
            }
            else
                fillJSON(null, lFiles);
        }
        else
            sendResponse({
                status  : NOT_FOUND,
                data    : lError.toString(),
                request : lReq,
                response: lRes
            });
    }
    
    /** async getting file states
     * and putting it to lStats object
     */
    function getFilesStat(pParams){
        var lError, lStat, lData,
            lAllStats, lName, lCallBack;
        
        if(pParams){
            lError      = pParams.error;
            lStat       = pParams.data;
            lData       = pParams.params;
            
            if(lData){
                lAllStats   = lData.stats;
                lName       = lData.name;
                lCallBack   = lData.callback;
            }
        }
        
        if(lAllStats)
            lAllStats[lName] = !lError ? lStat   : {
                'mode'          : 0,
                'size'          : 0,
                'isDirectory'   : Util.retFalse
            };
        
        Util.exec(lCallBack);
    };
            
    /**
     * Function fill JSON by file stats
     *
     * @param pStats - object, contain file stats.
     *          example {'1.txt': stat}
     *
     * @param pFiles - array of files of current directory
     */
    function fillJSON(pParams){
        var lFiles, lAllStats, lHTTP,
            i, n, lReq, lRes;
        
        if(pParams){
            lFiles      = pParams.files && (n = lFiles.length || 0);
            lAllStats   = pParams.stats;
            lHTTP       = pParams.data;
            
            if(lHTTP){
                lReq    = lHTTP.request,
                lRes    = lHTTP.response;
            }
        }
        /* данные о файлах в формате JSON*/
        var lJSON       = [],
            lJSONFile   = {},
            lList,
            lDirPath = getDirPath(lReq);
            
        lJSON[0]        = {
            path    : lDirPath,
            size    : 'dir'
        };
        
        for( i = 0; i < n; i++){
            /*
             *Переводим права доступа в 8-ричную систему
             */
            var lName = lFiles[i],
            
                lMode   = (lStats[lName].mode-0).toString(8),
                lStats  = lAllStats[lName],
                lIsDir  = lStats.isDirectory();
            
            /* Если папка - выводим пиктограмму папки   *
             * В противоположном случае - файла         */
            lJSONFile = {
                'name'  : lFiles[i],
                'size'  : lIsDir ? 'dir' : lStats.size,
                'uid'   : lStats.uid,
                'mode'  : lMode};
            
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
            
            fs.readFile(INDEX, indexReaded(lList));
            
        }else{
            lDirPath = lDirPath.substr(lDirPath, lDirPath.lastIndexOf('/') );
            
            /* в обычном режиме(когда js включен
             * высылаем json-структуру файлов
             * с соответствующими заголовками
             */
            lList   = JSON.stringify(lJSON);
            
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if( isGZIP(lReq) ){                
                zlib.gzip(lList, call(lGzipCB, {
                    
                }));
            }
            /* если не поддерживаеться - отсылаем данные без сжатия*/
            else
                sendResponse({
                    name    : INDEX,
                    data    : lList,
                    request : lReq,
                    response: lRes
                });
                
        }
    }
    
    /**
     *@param pList
     */
    function indexReaded(pList){
        return function(pError, pIndex){
            if(pError){
                return Util.log(pError);
            }
                        
            pIndex = pIndex.toString();
            
            
            var lProccessed = Util.exec(lIndexProccessing, {
                data        : pIndex,
                additional  : pList
            });
            
            if(lProccessed)
                pIndex = lProccessed;
            
             /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            if (isGZIP(lReq) ) {
                zlib.gzip(pIndex,
                    call (gzipData, {
                        request : lReq,
                        response: lRes
                    }));
            }
            
            /* если не поддерживаеться - отсылаем данные без сжатия*/
            else
                sendResponse({
                    name    : INDEX,
                    data    : pIndex,
                    request : lReq,
                    response: lRes
                });
        };
    }
    
    /** 
     * Функция генерирует функцию считывания файла
     * таким образом, что бы у нас было 
     * имя считываемого файла
     * @param pName - полное имя файла
     */
    function getReadFileFunc(pName){
        var lReadFile = function(pError, pData){
            if (!pError){
                Util.log('file ' + pName + ' readed');
                
                
                /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
                if( isGZIP(lReq)  )
                    zlib.gzip(pData, call(gzipData, lParams));
                else
                    sendResponse({
                        name    : pName,
                        data    : pData,
                        request : lReq,
                        response: lRes
                    });
            }
            else
                sendResponse({
                    name    : pName,
                    status  : NOT_FOUND,
                    data    : pError.toString(),
                    request : lReq,
                    response: lRes
                });
            
            return lReadFile;
        };
    }
    
    /**
     * Функция получает сжатые данные
     * @param pHeader - заголовок файла
     * @pName
     */
    function gzipData(pParams){
        var lError, lResult,
            lSendData, lData, lName, lReq, lRes;
        
        if(pParams){
            lError  = pParams.error;
            lResult = pParams.data;
            
            lData   = pParams.params;
            
            if(lData){
                lReq    = lSendData.request,
                lRes    = lSendData.response;
                lName   = lSendData.name;
            }
        }
            
        lSendData = {
            request : lReq,
            response: lRes
        };
        
        if(!lError){
            lSendData.name      = lName;
            lSendData.data      = lResult;
        }
        else{
            lSendData.status    = NOT_FOUND,
            lSendData.data      = lError.toString(),
        }
        
        sendResponse(lSendData);
    }
    
    /**
     * Функция высылает ответ серверу 
     * @param pHead       - заголовок
     * @param Data       - данные
     * @param pName       - имя отсылаемого файла
     */
    function sendResponse(pParams){
        var lName, lData, lReq, lRes, lStatus;
        
        if(pParams){
            lName   = pParams.name;
            lData   = pParams.data;
            lReq    = pParams.request,
            lRes    = pParams.response;
            lStatus = pParams.status || OK;
        }
        
        if(lStatus === NOT_FOUND)
            Util.log(lData);
        
        if(lRes && lReq){
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
            var lPath       = lName || getCleanPath(lReq),
                lQuery      = getQuery(lReq),
                lGzip       = isGZIP(lReq),
                lHead       = main.generateHeaders(lPath, lGzip, lQuery);
            
            lRes.writeHead(lStatus, lHead);
            lRes.end(lData);
            
            Util.log(lPath + ' sended');
        }
    }
    
    function getQuery(pReq){
        var lQuery, lParsedUrl;
        
        if(pReq){
            lParsedUrl  = url.parse(pReq.url);
            lQuery      = lParsedUrl.query;
        }
        
        return lQuery;
    }
    
    function getPath(pReq){
        var lParsedUrl  = url.parse(pReq.url),
            lPath       = lParsedUrl.pathname;
        
        return lPath;
    }
    
    function getDirPath(pReq){
        var lPath = getPath(pReq);
        
        /* Если мы не в корне добавляем слеш к будующим ссылкам */
        if(lPath !== '/')
            lPath += '/';
        
        return lPath;
    }
    
    function getCleanPath(pReq){
        var lPath = getPath(pReq),
            lRet = Util.removeStr(lPath, [NO_JS, FS]) || '/';
        
        return lRet;
    }
    
    function call(pFunc, pParams){
        var lFunc = function(pError, pData){
            Util.exec(pFunc, {
                error   : pError,
                data    : pData,
                params  : pParams
            });
        };
        
        return lFunc;
    }
    
    function noJS(pReq){
        var lNoJS, lPath;
        
        if(pReq){
            lPath = getPath(pReq);
            
            lNoJS = Util.isContainStr(lPath, CloudFunc.NoJS)
                && lPath === '/' && getQuery() !== 'json';
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