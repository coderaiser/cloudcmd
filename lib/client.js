/* Функция которая возвратит обьект CloudCmd
 * @CloudFunc - обьект содержащий общий функционал
 *  клиентский и серверный
 */
var Util, DOM, CloudFunc, CloudCmd;

(function(Util, DOM){
    'use strict';
    
    var Key, Config, Modules, FileTemplate, PathTemplate,
        Events  = DOM.Events,
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
    
    CloudCmd.GoogleAnalytics         = function(){
       Events.addOneTime('mousemove', function(){
           var lUrl = CloudCmd.LIBDIRCLIENT + 'google_analytics.js';
            
            setTimeout(function(){
                DOM.jsload(lUrl);
            }, 5000);
       });
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
                    Util.retExec(route, location.hash),
                    initKeysPanel,
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
        
        DOM.Events.add(['unload', 'beforeunload'], function (pEvent) {
                var lRet, lIsBind = Key && Key.isBind();
                
                if(!lIsBind) {
                    DOM.preventDefault(pEvent);
                    lRet = 'Please make sure that you saved all work.';
                }
                
                return lRet;
            });
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
            
            Events.addContextMenu(function(pEvent){
                CloudCmd.Menu.ENABLED || DOM.preventDefault(pEvent);
            }, document);
            
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
    
    function initKeysPanel(pCallBack){
        var i, lButton, lEl,
            lKeysPanel = {},
        
            lFuncs =[
                null,
                CloudCmd.Help,              /* f1 */
                DOM.renameCurrent,          /* f2 */
                CloudCmd.View,              /* f3 */
                CloudCmd.Edit,              /* f4 */
                DOM.copyCurrent,            /* f5 */
                DOM.moveCurrent,            /* f6 */
                DOM.promptNewDir,           /* f7 */
                DOM.promptDeleteSelected,   /* f8 */
                CloudCmd.Menu,              /* f9 */
            ];
        
        for (i = 1; i <= 9; i++) {
            lButton             = 'f' + i,
            lEl                 = DOM.getById('f' + i);
            lKeysPanel[lButton] = lEl;
            
            if (i === 1 || i === 3 || i === 4 || i === 9)
                Events.addOneTime('click', lFuncs[i], lEl);
            else
                Events.addClick(lFuncs[i], lEl);
        }
        
        lButton                 = '~',
        lEl                     = DOM.getById('~');
        lKeysPanel[lButton]     = lEl;
        Events.addOneTime('click', CloudCmd.Console, lEl);
        
        CloudCmd.KeysPanel = lKeysPanel;
        Util.exec(pCallBack);
    }
    
    function baseInit(pCallBack) {
        if (window.applicationCache)
            Events.add('updateready', function() {
                var ret = confirm('An update is available. Reload now?');
                
                if (ret)
                    location.reload();
            
            }, applicationCache);
            
        Events.add(['dragstart', 'dragend'], function () {
            var panels  = DOM.getByClass('panel'),
                i       = 0,
                n       = panels.length;
            
            for (i = 0; i < n; i++)
                DOM.toggleClass(panels[i], 'selected-panel');
        });
        
        /* загружаем общие функции для клиента и сервера */
        DOM.jsload(CloudCmd.LIBDIR + 'cloudfunc.js', function() {
            Events.add("popstate", function(pEvent) {
                var lPath   = pEvent.state + '?json';
                
                if (pEvent.state) {
                    lPath   = pEvent.state + '?json';
                    ajaxLoad(lPath, {nohistory: true});
                } else
                    route(location.hash);
                
                return true;
            });
            
            changeLinks(CloudFunc.LEFTPANEL);
            changeLinks(CloudFunc.RIGHTPANEL);
                    
            /* устанавливаем переменную доступности кэша                    */
            Cache.setAllowed(true);
            /* Устанавливаем кэш корневого каталога                         */ 
            var lDirPath = DOM.getCurrentDirPath();
            if (!Cache.get(lDirPath))
                Cache.set(lDirPath, getJSONfromFileTable());
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
    
    function route(pPath){
        var lQuery, lModule, lFile, lCurrent;
        
        if (pPath.length > 0) {
            lQuery  = pPath.split('/');
            
            if (lQuery.length > 0) {
                lModule     = Util.getStrBigFirst(lQuery[1]);
                lFile       = lQuery[2];
                lCurrent    = DOM.getCurrentFileByName(lFile);
                if (lFile && !lCurrent)
                    Util.log('set current file: error("' + lFile + '")');
                else {
                    DOM.setCurrentFile(lCurrent);
                    CloudCmd.execFromModule(lModule, 'show');
                }
            }
        }
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
    CloudCmd.getpPathTemplate   = getSystemFile(PathTemplate,   CloudCmd.HTMLDIR + 'path.html');
    
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
    
    
    /**
     * функция меняет ссыки на ajax-овые 
     * @param pPanelID
     */
    function changeLinks(pPanelID){
        /* назначаем кнопку очистить кэш и показываем её */
        var lClearcache = DOM.getById('clear-cache');
            Events.addClick(Cache.clear, lClearcache);
            
        /* меняем ссылки на ajax-запросы */
        var lPanel  = DOM.getById(pPanelID),
            a       = DOM.getByTag('a', lPanel),
            
            /* right mouse click function varible */
            lOnContextMenu_f = function(pEvent){
                var lReturn_b = true;
                
                Key && Key.unsetBind();
                
                /* getting html element
                 * currentTarget - DOM event
                 * target        - jquery event
                 */
                var lTarget = pEvent.currentTarget || pEvent.target;
                DOM.setCurrentFile(lTarget);
                
                if(Util.isFunction(CloudCmd.Menu) ){
                    CloudCmd.Menu({
                        x: pEvent.clientX,
                        y: pEvent.clientY
                    });
                    
                    /* disabling browsers menu*/
                    lReturn_b = false;
                    DOM.Images.showLoad();
                }        
                
                return lReturn_b;
            },
            
        /* drag and drop function varible
         * download file from browser to descktop
         * in Chrome (HTML5)
         */
            lOnDragStart_f = function(pEvent){
                var lElement    = pEvent.target,
                    lLink       = lElement.href,
                    lName       = lElement.textContent;
                
                /* if it's directory - adding json extension */
                if( DOM.isCurrentIsDir() ){
                    lName       += '.json';
                    lLink       += '?json';
                }
                
                pEvent.dataTransfer.setData("DownloadURL",
                    'application/octet-stream'  + ':' +
                    lName                       + ':' + 
                    lLink);
            },
            
            lSetCurrentFile_f = function(pEvent){
                var pElement    = pEvent.target,
                    lTag        = pElement.tagName;
                
                if(lTag !== 'LI')
                    do{
                        pElement    = pElement.parentElement;
                        lTag        = pElement.tagName;
                    }while(lTag !== 'LI');
                
                DOM.setCurrentFile(pElement);
            },
            
            lUrl                = CloudCmd.HOST,
            lLoadDirOnce        = CloudCmd.loadDir();
            
        CloudCmd.refresh    =  function(pCurrent){
            var lNEEDREFRESH    = true,
                lPanel          = pCurrent && pCurrent.parentElement,
                lPath           = DOM.getCurrentDirPath(lPanel),
                lLink           = CloudFunc.FS + lPath,
                lNotSlashlLink  = CloudFunc.removeLastSlash(lLink),
                lLoad           = CloudCmd.loadDir(lNotSlashlLink, lNEEDREFRESH);
            lLoad();
        };
        
        /* ставим загрузку гифа на клик*/
        Events.addClick( CloudCmd.refresh, a[0].parentElement );
        
        /* start from 1 cous 0 is a path and it's setted up */
        for(var i = 1, n = a.length; i < n ; i++){
            /* убираем адрес хоста*/
            var ai              = a[i],
                lLink           = Util.removeStr(ai.href, lUrl),
                lLoadDir        = CloudCmd.loadDir(lLink),
                /* устанавливаем обработчики на строку
                 * на двойное нажатие на левую кнопку мышки */
                lLi = ai.parentElement.parentElement;
            
            /* if we in path - set click event */
            if (lLi.className === 'path')
                Events.addClick( lLoadDir, ai );
            else {
                Events.add({
                    'click'         : DOM.preventDefault,
                    'mousedown'     : lSetCurrentFile_f,
                    'contextmenu'   : lOnContextMenu_f
                    }, lLi);
                
                Events.add('dragstart', lOnDragStart_f, ai);
                
                /* если ссылка на папку, а не файл */
                if(ai.target !== '_blank'){
                    Events.add({
                        'dblclick' : lLoadDirOnce,
                        'touchend' : lLoadDirOnce
                        }, lLi);
                }
                
                lLi.id = (ai.title ? ai.title : ai.textContent) +
                    '(' + pPanelID + ')';
            }
        }
    }
    
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
            lWasRefresh_b   = lPath[0].textContent === pJSON[0].path;
        
        CloudCmd.getFileTemplate(function(pTemplate){
            CloudCmd.getpPathTemplate(function(pPathTemplate){
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
                
                changeLinks(pElem);
                
                if(lName === '..' && lDir !== '/')
                    currentToParent(lDir);
            });
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
    
    Events.addOneTime('load', function(){
        /* базовая инициализация*/
        CloudCmd.init();
        
        /* загружаем Google Analytics */
        CloudCmd.GoogleAnalytics();
    });
})(Util, DOM);
