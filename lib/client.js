/* Функция которая возвратит обьект CloudCmd
 * @CloudFunc - обьект содержащий общий функционал
 *  клиентский и серверный
 */
var Util, DOM, CloudFunc, CloudCmd;

(function(Util, DOM){
    'use strict';
    
    var Key, Config, Modules, FileTemplate, PathTemplate, Listeners,
        Cache   = DOM.Cache;
    
    CloudCmd = {
        LIBDIR                  : '/lib/',
        LIBDIRCLIENT            : '/lib/client/',
        JSONDIR                 : '/json/',
        HTMLDIR                 : '/html/',
        HEIGHT                  : 0,
        MIN_ONE_PANEL_WIDTH     : 1155,
        OLD_BROWSER             : false,
        
        HOST                    :  (function(){
            var lLocation = document.location;
            return lLocation.protocol + '//' + lLocation.host;
        })()
    };
    
    /**
     * Функция привязываеться ко всем ссылкам и
     *  загружает содержимое каталогов
     * 
     * @param pLink - ссылка
     * @param pNeedRefresh - необходимость обязательной загрузки данных с сервера
     */
    CloudCmd.loadDir                = function(pLink, pNeedRefresh){
        return function(pEvent){
            /* показываем гиф загрузки возле пути папки сверху
             * ctrl+r нажата? */
            
            var lCurrentLink    = DOM.getCurrentLink(),
                lHref           = lCurrentLink.href,
                lLink           = pLink || Util.removeStr(lHref, CloudCmd.HOST);
            
            lLink += '?json';
            
            if(lLink || lCurrentLink.target !== '_blank'){
                DOM.Images.showLoad(pNeedRefresh ? {top:true} : null);
                
                /* загружаем содержимое каталога */
                ajaxLoad(lLink, { refresh: pNeedRefresh });
            }
            
            DOM.preventDefault(pEvent);
        };
    };
    
    
    /**
     * функция устанавливает курсор на каталог
     * с которого мы пришли, если мы поднялись
     * в верх по файловой структуре
     * @param pDirName - имя каталога с которого мы пришли
     */
    function currentToParent(pDirName){
        var lRootDir;
        /* убираем слэш с имени каталога */
        pDirName    = Util.removeStr(pDirName, '/');
        lRootDir    = DOM.getCurrentFileByName(pDirName);
        
        if (lRootDir){
            DOM.setCurrentFile(lRootDir);
            DOM.scrollIntoViewIfNeeded(lRootDir, true);
        }
    }
    
    /**
     * function load modules
     * @pParams = {name, path, func, dobefore, arg}
     */
    function loadModule(pParams){
        if(pParams){
            var lName       = pParams.name,
                lPath       = pParams.path,
                lFunc       = pParams.func,
                lDoBefore   = pParams.dobefore;
            
            if( Util.isString(pParams) )
                lPath = pParams;
            
            if(lPath && !lName){
                lName = Util.getStrBigFirst(lPath);
                lName = Util.removeStr(lName, '.js');
                
                var lSlash = lName.indexOf('/');
                if(lSlash > 0){
                    var lAfterSlash = lName.substr(lSlash);
                    lName = Util.removeStr(lName, lAfterSlash);
                }
            }
            
            if( !Util.isContainStr(lPath, '.js') )
                lPath += '.js';
            
            if(!CloudCmd[lName])
                CloudCmd[lName] = function(pArg){
                    Util.exec(lDoBefore);
                    
                    return DOM.jsload(CloudCmd.LIBDIRCLIENT + lPath, lFunc ||
                        function(){
                            Util.exec(CloudCmd[lName].init, pArg);
                        });
                };
        }
    }
    
    /** Конструктор CloudClient, который
     * выполняет весь функционал по
     * инициализации
     */
    CloudCmd.init                    = function(){
        var lCallBack = function(){
                Util.loadOnLoad([
                    Util.retExec(CloudCmd.route, location.hash),
                    initModules,
                    baseInit
                ]);
            },
            lFunc = function(pCallBack){
                CloudCmd.OLD_BROWSER = true;
                var lSrc = CloudCmd.LIBDIRCLIENT + 'polyfill.js';
                
                DOM.jqueryLoad(
                    DOM.retJSLoad(lSrc, pCallBack)
                );
            };
        
        Util.ifExec(document.body.scrollIntoViewIfNeeded, lCallBack, lFunc);
    };
    
    CloudCmd.route                   = function(pPath){
        var lQuery, lModule, lFile, lCurrent, lMsg;
        
        if (pPath.length > 0) {
            lQuery  = pPath.split('/');
            
            if (lQuery.length > 0) {
                lModule     = Util.getStrBigFirst(lQuery[1]);
                lFile       = lQuery[2];
                lCurrent    = DOM.getCurrentFileByName(lFile);
                if (lFile && !lCurrent) {
                    lMsg = CloudFunc.format('set current file', lFile, 'error');
                    Util.log(lMsg);
                } else {
                    DOM.setCurrentFile(lCurrent);
                    CloudCmd.execFromModule(lModule, 'show');
                }
            }
        }
    };
    
    function initModules(pCallBack){
        loadModule({
            /* привязываем клавиши к функциям */
            path  : 'key.js',
            func : function(){
                Key  = CloudCmd.Key;
                Key.bind();
            }
         });
        
        CloudCmd.getModules(function(pModules) {
            pModules                = pModules || [];
            
            var i, n, lStorage            = 'storage',
                lShowLoadFunc       = Util.retFunc( DOM.Images.showLoad, {top:true} ),
                
                lDoBefore           = {
                    'edit'  : lShowLoadFunc,
                    'view'  : lShowLoadFunc,
                    'menu'  : lShowLoadFunc
                },
                
                lLoad = function(pName, pPath, pDoBefore) {
                    loadModule({
                        path        : pPath,
                        name        : pName,
                        dobefore    : pDoBefore
                    });
                };
            
            for (i = 0, n = pModules.length; i < n ; i++) {
                var lModule = pModules[i];
                
                if( Util.isString(lModule) )
                    lLoad(null, lModule, lDoBefore[lModule]);
            }
            
            var lStorageObj = Util.findObjByNameInArr( pModules, lStorage ),
                lMod        = Util.getNamesFromObjArray( lStorageObj );
                
            for (i = 0, n = lMod.length; i < n; i++){
                var lName = lMod[i],
                    lPath = lStorage + '/_' + lName.toLowerCase();
                
                lLoad(lName, lPath);
            }
            
            
            Util.exec(pCallBack);
    
        });
    }
    
    
    function baseInit(pCallBack) {
        var LIB         = CloudCmd.LIBDIR,
            LIBCLIENT   = CloudCmd.LIBDIRCLIENT,
            files       = [
                LIB         + 'cloudfunc.js',
                LIBCLIENT   + 'listeners.js'
            ];
                
        /* загружаем общие функции для клиента и сервера */
        DOM.anyLoadInParallel(files, function() {
            Listeners = CloudCmd.Listeners;
            
            Listeners.init();
            /* загружаем Google Analytics */
            Listeners.analytics();
            Listeners.changeLinks(CloudFunc.LEFTPANEL);
            Listeners.changeLinks(CloudFunc.RIGHTPANEL);
            
            CloudCmd.KeysPanel = Listeners.initKeysPanel();
                    
            CloudCmd.getConfig(function(config) {
                var localStorage = config.localStorage;
                /* устанавливаем переменную доступности кэша                    */
                Cache.setAllowed(localStorage);
                /* Устанавливаем кэш корневого каталога                         */ 
                var lDirPath = DOM.getCurrentDirPath();
                if (!Cache.get(lDirPath))
                    Cache.set(lDirPath, getJSONfromFileTable());
                });
        });
        
        /* выделяем строку с первым файлом                                  */
        var lFmHeader = DOM.getByClass('fm-header');
        if(lFmHeader && lFmHeader[0]){
            var lCurrent = lFmHeader[0].nextSibling;
            DOM.setCurrentFile(lCurrent);
        }
        
        /* показываем элементы, которые будут работать только, если есть js */
        var lFM = DOM.getById('fm');
        lFM.className='localstorage';
            
        /* устанавливаем размер высоты таблицы файлов
         * исходя из размеров разрешения экрана
         *
         * формируем и округляем высоту экрана
         * при разрешениии 1024x1280:
         * 658 -> 700
         */
        
        var lHeight = window.screen.height;
            lHeight = lHeight - (lHeight/3).toFixed();
        
        lHeight = (lHeight / 100).toFixed() * 100;
        
        CloudCmd.HEIGHT = lHeight;
        
        DOM.cssSet({
            id:'cloudcmd',
            inner:
                '.panel{'                           +
                    'height:' + lHeight +'px;'      +
                '}'
        });
        
        Util.exec(pCallBack);
        CloudCmd.Key();
    }
    
    function getSystemFile(pGlobal, pURL){
        
        function lGetSysFile(pCallBack){
            Util.ifExec(pGlobal, pCallBack, function(pCallBack){
                if(!pGlobal)
                    DOM.ajax({
                        url     : pURL,
                        success : function(pLocal){
                            pGlobal = pLocal;
                            Util.exec(pCallBack, pLocal);
                        }
                    });
            });
        }
        
        return lGetSysFile;
    }
    
    
    
    CloudCmd.getConfig          = getSystemFile(Config,         CloudCmd.JSONDIR + 'config.json');
    CloudCmd.getModules         = getSystemFile(Modules,        CloudCmd.JSONDIR + 'modules.json');
    CloudCmd.getFileTemplate    = getSystemFile(FileTemplate,   CloudCmd.HTMLDIR + 'file.html');
    CloudCmd.getPathTemplate    = getSystemFile(PathTemplate,   CloudCmd.HTMLDIR + 'path.html');
    
    CloudCmd.execFromModule         = function(pModuleName, pFuncName, pParams){
        var lObject     = CloudCmd[pModuleName];
        Util.ifExec(Util.isObject(lObject),
            function(){
                var lObj = CloudCmd[pModuleName];
                Util.exec( lObj[pFuncName], pParams);
            },
            
            function(pCallBack){
                Util.exec(lObject, pCallBack);
            });
    };
    
    CloudCmd.refresh    =  function(pCurrent){
        var lNEEDREFRESH    = true,
            lPanel          = pCurrent && pCurrent.parentElement,
            lPath           = DOM.getCurrentDirPath(lPanel),
            lLink           = CloudFunc.FS + lPath,
            lNotSlashlLink  = CloudFunc.removeLastSlash(lLink),
            lLoad           = CloudCmd.loadDir(lNotSlashlLink, lNEEDREFRESH);
        
        lLoad();
    };
    
    /**
     * Функция загружает json-данные о Файловой Системе
     * через ajax-запрос.
     * @param path - каталог для чтения
     * @param pOptions
     * { refresh, nohistory } - необходимость обновить данные о каталоге
     */
    function ajaxLoad(pPath, pOptions){
        if(!pOptions)
            pOptions    = {};
        
        /* Отображаем красивые пути */
        var lSLASH      = '/',
            lFSPath     = decodeURI(pPath),
            lNOJSPath   = Util.removeStr( lFSPath, '?json' ),
            lCleanPath  = Util.removeStr( lNOJSPath, CloudFunc.FS   ) || lSLASH,
            
            lOldURL = window.location.pathname;
        
        if(lCleanPath === lSLASH)
            lNOJSPath = lSLASH;
        
        Util.log ('reading dir: "' + lCleanPath + '";');
        
        if(!pOptions.nohistory)
            DOM.setHistory(lNOJSPath, null, lNOJSPath);
        
        DOM.setTitle( CloudFunc.getTitle(lCleanPath) );
        
        var lPanel = DOM.getPanel().id;
         /* если доступен localStorage и
          * в нём есть нужная нам директория -
          * читаем данные с него и
          * выходим
          * если стоит поле обязательной перезагрузки - 
          * перезагружаемся
          */ 
        var lRet = pOptions.refresh;
        if(!lRet){
            var lJSON = Cache.get(lCleanPath);
            
            if (lJSON){
                lJSON = Util.parseJSON(lJSON);
                createFileTable(lPanel, lJSON);
            }
            else
                lRet = true;
        }
        
        if(lRet)
            DOM.getCurrentFileContent({
                url     : lFSPath,
                
                dataType: 'json',
                
                error   : function(){
                    DOM.setHistory(lOldURL, null, lOldURL);
                },
                
                success : function(pData){
                    createFileTable(lPanel, pData);
                    
                    /* переводим таблицу файлов в строку, для   *
                     * сохранения в localStorage                */
                    var lJSON_s = Util.stringifyJSON(pData);
                    Util.log(lJSON_s.length);
                    
                    /* если размер данных не очень бошьой       *
                     * сохраняем их в кэше                      */
                    if(lJSON_s.length < 50000 )
                        Cache.set(lCleanPath, lJSON_s);
                }
            });
    }
    
    /**
     * Функция строит файловую таблицу
     * @param pEleme - родительский элемент
     * @param pJSON  - данные о файлах
     */
    function createFileTable(pElem, pJSON){
        var lElem           = DOM.getById(pElem),
            /* getting current element if was refresh */
            lPath           = DOM.getByClass('path', lElem),
            
            lCurrent        = DOM.getCurrentFile(),
            lDir            = DOM.getCurrentDirName(),
            
            lName           = DOM.getCurrentName(lCurrent),
            lWasRefresh_b   = lPath[0].textContent === pJSON[0].path,
            lFuncs          = [
                CloudCmd.getFileTemplate,
                CloudCmd.getPathTemplate
            ];
        
        Util.asyncCall(lFuncs, function(pTemplate, pPathTemplate) {
            /* очищаем панель */
            var i = lElem.childNodes.length;
            
            while(i--)
                lElem.removeChild(lElem.lastChild);
            
            lElem.innerHTML = CloudFunc.buildFromJSON(pJSON, pTemplate, pPathTemplate);
            
            /* если нажали на ссылку на верхний каталог*/
            var lFound;
            /* searching current file */
            if(lWasRefresh_b){
                var n = lElem.childNodes.length;
                for(i = 2; i < n ; i++){
                    var lVarCurrent = lElem.childNodes[i],
                        lVarName    = DOM.getCurrentName(lVarCurrent);
                    
                    lFound = lVarName === lName;
                    
                    if(lFound){
                        lCurrent    = lElem.childNodes[i];
                        break;
                    }
                }
            }
            if(!lFound) /* .. */
                lCurrent = lElem.childNodes[2];
            
            DOM.setCurrentFile(lCurrent);
            
            Listeners.changeLinks(pElem);
            
            if(lName === '..' && lDir !== '/')
                currentToParent(lDir);
        });
    }
    
    /**
     * Функция генерирует JSON из html-таблицы файлов и
     * используеться при первом заходе в корень
     */
    function getJSONfromFileTable(){
        var lLeft       = DOM.getById('left'),
            lPath       = DOM.getByClass('path')[0].textContent,
            
            lFileTable  = [{
                path    : lPath,
                size    : 'dir'
            }],
            
            lLI         = DOM.getByTag('li', lLeft),
            i, n, j     = 1;      /* счётчик реальных файлов */
            
        /* счётчик элементов файлов в DOM
         * Если путь отличный от корневного
         * второй элемент li - это ссылка на верхний
         * каталог '..'
         */
         
        /* пропускам Path и Header*/
        for(i = 2, n = lLI.length; i < n; i++){
            var lCurrent    = lLI[i],
                lName       = DOM.getCurrentName(lCurrent),
                lSize       = DOM.getCurrentSize(lCurrent),
            
            lMode           = DOM.getCurrentMode(lCurrent);
            lMode           = CloudFunc.getNumericPermissions(lMode);
            
            if(lName !== '..')
                lFileTable[ j++ ] = {
                    name: lName,
                    size: lSize,
                    mode: lMode
                };
        }
        return Util.stringifyJSON(lFileTable);
    }
    
    DOM.Events.addOneTime('load', CloudCmd.init);
})(Util, DOM);
