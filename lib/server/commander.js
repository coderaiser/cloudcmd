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
        INDEX               = HTMLDIR + 'index.html',
        REQUEST             = 'request',
        RESPONSE            = 'response',
        
        IndexProcessingFunc = null;
    
    
    exports.sendContent = function(pParams){
        var lRet = Util.checkObj(pParams,
            ['processing'],
            [REQUEST, RESPONSE]);
        
        if(lRet){
            var lReq            = pParams.request,
                lRes            = pParams.response,
                lPath           = getCleanPath(lReq);
            
            IndexProcessingFunc = pParams.processing;
            
            fs.stat(lPath, function(pError, pStat){
                if(!pError)
                    if(pStat.isDirectory())
                        fs.readdir(lPath, call(readDir, pParams) );
                    else 
                        main.sendFile({
                            name        : lPath,
                            request     : lReq,
                            response    : lRes
                        });
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
                lFilesData = {
                    files       : lFiles,
                    stats       : lStats,
                    request     : lReq,
                    response    : lRes
                },
                
                lFill   = function(){
                    fillJSON(lFilesData);
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
                fillJSON(lFilesData);
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
            lDirPath = getDirPath(lReq);
            
        lJSON[0]        = {
            path    : lDirPath,
            size    : 'dir'
        };
        
        for( i = 0; i < n; i++ ){
            /* Переводим права доступа в 8-ричную систему */
            var lName = lFiles[i],
            
                lStats  = lAllStats[lName],
                lMode   = (lStats.mode-0).toString(8),
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
            
            fs.readFile(INDEX, call(readFile, {
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
                name    : INDEX,
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
          var lRet = Util.checkObj(pParams,
            ['error', 'data']);
        
        if(lRet)
            lRet = Util.checkObj(pParams.params,
                ['callback'], [REQUEST, RESPONSE, 'name', 'list']);
        
        if(lRet){
            var p           = pParams,
                c           = pParams.params,
                lParams     = {
                    request : c.request,
                    response: c.response
                },
                
                lProccessed = Util.exec(IndexProcessingFunc, {
                    data        : p.data,
                    additional  : c.list
                });
            
            if(lProccessed)
                p.data = lProccessed;
            
            if (!p.Error){
                lParams.name      = c.Name;
                lParams.data      = p.data;
                
                Util.log('file ' + c.name + ' readed');
            }
            else{
                lParams.status    = NOT_FOUND;
                lParams.data      = p.error.toString();
            }
                
            sendResponse(lParams);
        }
    }
    
    /**
     * Функция получает сжатые данные
     * @param pHeader - заголовок файла
     * @pName
     */
    function gzipData(pParams){
        var lRet = Util.checkObj(pParams,
            ['error', 'data']);
        
        if(lRet)
            lRet = Util.checkObj(pParams.params,
                ['callback'], ['name']);
        
        if(lRet){
            var p           = pParams,
                c           = pParams.params,
                lData   = {};
            
            if(!p.error){
                lData.name      = c.name;
                lData.data      = p.data;
            }
            else{
                lData.status    = NOT_FOUND;
                lData.data      = p.error.toString();
            }
            
            Util.exec(c.callback, lData);
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
                || lPath === '/' || getQuery() !== 'json';
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
                lQuery      = getQuery(p.request),
                /* download, json */
                lGzip       = isGZIP(p.request),
                lHead       = main.generateHeaders(lPath, lGzip, lQuery);
            
            /* если браузер поддерживает gzip-сжатие - сжимаем данные*/
            Util.ifExec(!lGzip,
                function(pParams){
                    var lRet = Util.checkObj(pParams, ['status', 'data']);
                    
                    if(lRet){
                        p.status    = pParams.status;
                        p.data      = pParams.data;
                    }
                    
                    p.response.writeHead(p.status || OK, lHead);
                    p.request.end();
                    
                    Util.log(lPath + ' sended');
                    Util.log( p.status === NOT_FOUND && p.data );
                },
                
                function(pCallBack){
                    zlib.gzip (call(gzipData, {
                        callback    : pCallBack,
                        data        : p.data
                        }));
                });
        }
    }
    
})();