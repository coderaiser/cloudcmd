/* Функция которая возвратит обьект CloudCommander
 * @CloudFunc - обьект содержащий общий функционал
 *  клиентский и серверный
 */

var Util, DOM, CloudFunc, $, KeyBinding, CloudCommander = (function(Util, DOM){
'use strict';

var Config, Modules;

/* Клиентский обьект, содержащий функциональную часть*/
var CloudCmd = {
    /* Конструктор CloudClient, который выполняет
     * весь функционал по инициализации
     */
    init                    : null, /* start initialization             */
    
    KeyBinding              : null, /* обьект обработки нажатий клавишь */
    KeysPanel               : null, /* panel with key buttons f1-f8     */
    Editor                  : null, /* function loads and shows editor  */
    Storage                 : null, /* function loads storage           */
    Viewer                  : null, /* function loads and shows viewer  */
    Terminal                : null, /* function loads and shows terminal*/
    Menu                    : null, /* function loads and shows menu    */
    GoogleAnalytics         : null,
    
    _loadDir                : null, /* Функция привязываеться ко всем
                                     * ссылкам и
                                     * загружает содержимое каталогов */
    
    /* ОБЬЕКТЫ */
    
    /* ПРИВАТНЫЕ ФУНКЦИИ */
    /* функция загружает json-данные о файловой системе */
    _ajaxLoad               : null,
    
    /* Функция генерирует JSON из html-таблицы файлов */
    _getJSONfromFileTable   : null,
    
    /* функция меняет ссыки на ajax-овые */
    _changeLinks            : null,
    
    /* КОНСТАНТЫ*/
    LIBDIR                  : '/lib/',
    LIBDIRCLIENT            : '/lib/client/',
    JSONDIR                 : '/json/',
    /* height of Cloud Commander
    * seting up in init()
    */
    HEIGHT                  : 0,
    MIN_ONE_PANEL_WIDTH     : 1155,
    OLD_BROWSER             : false,
    
    HOST                    :  (function(){
        var lLocation = document.location;
        return lLocation.protocol + '//' + lLocation.host;
    })()
};

CloudCmd.GoogleAnalytics         = function(){
   DOM.addOneTimeListener('mousemove', function(){
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
CloudCmd._loadDir                = function(pLink, pNeedRefresh){
    return function(pEvent){
        /* показываем гиф загрузки возле пути папки сверху
         * ctrl+r нажата? */
        
        var lCurrentLink    = DOM.getCurrentLink(),
            lHref           = lCurrentLink.href,
            lParent         = lCurrentLink.textContent,
            lLink           = pLink || Util.removeStr(lHref, CloudCmd.HOST),
            lDir            = DOM.getCurrentDir();
        
        lLink += '?json';
        
        if(lLink || lCurrentLink.target !== '_blank'){
            DOM.Images.showLoad(pNeedRefresh ? {top:true} : null);
            
            /* загружаем содержимое каталога */
            CloudCmd._ajaxLoad(lLink, { refresh: pNeedRefresh });
            
            /* если нажали на ссылку на верхний каталог*/
            if(lParent === '..' && lDir !== '/')
                CloudCmd._currentToParent(lDir);
        }
        
        DOM.preventDefault(pEvent);
    };
};


/**
 * Function edits file name
 *
 * @param pParent - parent element
 * @param pEvent
 */
CloudCmd._editFileName           = function(pParent){
    var lA = DOM.getCurrentLink(pParent);
    
    if (lA && lA.textContent !== '..'){
            
            lA.contentEditable = true;
            KeyBinding.unSet();
            
            /* setting event handler onclick
             * if user clicks somewhere keyBinded
             * backs
             */
            DOM.addOneTimeListener('click', function(){
                var lA = DOM.getCurrentLink(pParent);
                if (lA && lA.textContent !== '..')
                    lA.contentEditable = false;
                
                KeyBinding.set();
            });
    }
};


/** функция устанавливает курсор на каталог
 * с которого мы пришли, если мы поднялись
 * в верх по файловой структуре
 * @param pDirName - имя каталога с которого мы пришли
 */
CloudCmd._currentToParent        = function(pDirName){
    /* убираем слэш с имени каталога */
    pDirName        = Util.removeStr(pDirName, '/');
    
    /* опредиляем в какой мы панели:    *
     * правой или левой                 */
    var lPanel      = DOM.getPanel(),
        lRootDir    = DOM.getById(pDirName + '(' + lPanel.id + ')');
    
    /* if found li element with ID directory name   *
     * set it to current file                       */
    if(lRootDir){
        DOM.setCurrentFile(lRootDir);
        DOM.scrollIntoViewIfNeeded(lRootDir, true);
    }
};

/**
 * function load modules
 * @pParams = {name, path, func, dobefore, arg}
 */
function loadModule(pParams){
    if(!pParams) return;
    
    var lName       = pParams.name,
        lPath       = pParams.path,
        lFunc       = pParams.func,
        lDoBefore   = pParams.dobefore;
    
    if( Util.isString(pParams) )
        lPath = pParams;
    
    if(lPath && !lName){
        lName = lPath[0].toUpperCase() + lPath.substring(1);
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
/** Конструктор CloudClient, который
 * выполняет весь функционал по
 * инициализации
 */
CloudCmd.init                    = function(){
    var lCallBack = function(){
            Util.loadOnLoad([
                initKeysPanel,
                initModules,
                baseInit
            ]);
        },
        lFunc = function(pCallBack){
            CloudCmd.OLD_BROWSER = true;
            var lSrc = CloudCmd.LIBDIRCLIENT + 'ie.js';
            
            DOM.jqueryLoad(
                DOM.retJSLoad(lSrc, pCallBack)
            );
        };
        
    //Util.socketLoad();
    
    Util.ifExec(document.body.scrollIntoViewIfNeeded, lCallBack, lFunc);
};

function initModules(pCallBack){
    loadModule({
        /* привязываем клавиши к функциям */
        path  : 'keyBinding.js',
        func : function(){            
            KeyBinding  = CloudCmd.KeyBinding;
            KeyBinding.init();
        }
     });
    
    CloudCmd.getModules(function(pModules){
        pModules                = pModules || [];
        
        DOM.addContextMenuListener(function(pEvent){
            CloudCmd.Menu.ENABLED || DOM.preventDefault(pEvent);
        }, document);
        
        var lStorage            = 'storage',
            lShowLoadFunc       = Util.retFunc( DOM.Images.showLoad ),
            
            lDoBefore           = {
                'editor/_codemirror'    : lShowLoadFunc,
                'viewer'                : lShowLoadFunc
            },
            
            lLoad = function(pName, pPath, pDoBefore){
                loadModule({
                    path        : pPath,
                    name        : pName,
                    dobefore    : pDoBefore
                });
            };
        
        for(var i = 0, n = pModules.length; i < n ; i++){
            var lModule = pModules[i];
            
            if(Util.isString(lModule))
                lLoad(null, lModule, lDoBefore[lModule]);
        }
        
        var lStorageObj = Util.findObjByNameInArr( pModules, lStorage ),
            lMod        = Util.getNamesFromObjArray( lStorageObj );
            
        for(i = 0, n = lMod.length; i < n; i++){
            var lName = lMod[i],
                lPath = lStorage + '/_' + lName.toLowerCase();
            
            lLoad(lName, lPath);
        }
        
        
        Util.exec(pCallBack);

    });
}

function initKeysPanel(pCallBack){
    var lKeysPanel = {},
    
        lFuncs =[
            null,
            null,                   /* f1 */
            null,                   /* f2 */
            CloudCmd.Viewer,        /* f3 */
            CloudCmd.Editor,        /* f4 */
            null,                   /* f5 */
            null,                   /* f6 */
            null,                   /* f7 */
            DOM.promptDeleteCurrent,/* f8 */
        ];
    
    for(var i = 1; i <= 8; i++){
        var lButton         = 'f' + i,
            lEl             = DOM.getById('f' + i);
        
        DOM.addClickListener(lFuncs[i], lEl);
        lKeysPanel[lButton] = lEl;
    }
    
    CloudCmd.KeysPanel = lKeysPanel;
    Util.exec(pCallBack);
}

function baseInit(pCallBack){
    if(window.applicationCache){
        var lFunc = applicationCache.onupdateready;
        
        applicationCache.onupdateready = function(){
            Util.log('app cacheed');
            location.reload();
            
            Util.exec(lFunc);
        };
    }
    
    /* загружаем общие функции для клиента и сервера */
    DOM.jsload(CloudCmd.LIBDIR + 'cloudfunc.js',function(){
        DOM.addListener("popstate", function(pEvent) {
            var lPath   = pEvent.state;
            
            if(lPath)
                CloudCmd._ajaxLoad(lPath, {nohistory: true});
            
            return true;
        });
        
        /* берём из обьекта window общий с сервером функционал          */
        CloudFunc = window.CloudFunc;
        
        /* меняем ссылки на ajax'овые                                   */
        CloudCmd._changeLinks(CloudFunc.LEFTPANEL);
        CloudCmd._changeLinks(CloudFunc.RIGHTPANEL);
                
        /* устанавливаем переменную доступности кэша                    */
        DOM.Cache.isAllowed();
        /* Устанавливаем кэш корневого каталога                         */ 
        if( !DOM.Cache.get('/') )
            DOM.Cache.set('/', CloudCmd._getJSONfromFileTable());
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
    CloudCmd.KeyBinding();
}

CloudCmd.getConfig              = function(pCallBack){
    Util.ifExec(Config, pCallBack, function(pCallBack){
        DOM.ajax({
            url     : CloudCmd.JSONDIR + 'config.json',
            success : function(pConfig){
                Config = pConfig;
                Util.exec(pCallBack, pConfig);
            }
        });
    });
};

CloudCmd.getModules             = function(pCallBack){
    Util.ifExec(Modules, pCallBack, function(pCallBack){
        DOM.ajax({
            url     : CloudCmd.JSONDIR + 'modules.json',
            success : Util.retExec(pCallBack)
        });
    });
};


/* функция меняет ссыки на ajax-овые */
CloudCmd._changeLinks            = function(pPanelID){
    /* назначаем кнопку очистить кэш и показываем её */
    var lClearcache = DOM.getById('clear-cache');
        DOM.addClickListener(DOM.Cache.clear, lClearcache);
        
    /* меняем ссылки на ajax-запросы */
    var lPanel  = DOM.getById(pPanelID),
        a       = lPanel.getElementsByTagName('a'),
        
        /* номер ссылки иконки обновления страницы */
        lREFRESHICON = 0,
        
        /* right mouse click function varible */
        lOnContextMenu_f = function(pEvent){
            var lReturn_b = true;
            
            KeyBinding.unSet();
            
            /* getting html element
             * currentTarget - DOM event
             * target        - jquery event
             */
            var lTarget = pEvent.currentTarget || pEvent.target;
            DOM.setCurrentFile(lTarget);
            
            if(Util.isFunction(CloudCmd.Menu) ){
                CloudCmd.Menu({
                    x: pEvent.x,
                    y: pEvent.y
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
            if( DOM.isCurrentDir() ){
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
        
        lUrl = CloudCmd.HOST;
    
    var lLoadDirOnce        = CloudCmd._loadDir();
    for(var i = 0, n = a.length; i < n ; i++){
        /* убираем адрес хоста*/
        var ai              = a[i],
            link            = ai.href.replace(lUrl, ''),
            lNEADREFRESH    = i === lREFRESHICON,
            lLoadDir        = CloudCmd._loadDir(link, lNEADREFRESH);
        
        /* ставим загрузку гифа на клик*/
        if(lNEADREFRESH)
            DOM.addClickListener( lLoadDir, ai.parentElement );
            
        /* устанавливаем обработчики на строку
         * на двойное нажатие на левую кнопку мышки */
        else{
            var lLi = ai.parentElement.parentElement;
            
            /* if we in path changing onclick events */
            if (lLi.className === 'path') 
                DOM.addClickListener( lLoadDir, ai );
            else {
                DOM.addClickListener( DOM.preventDefault, lLi);
                DOM.addListener('mousedown', lSetCurrentFile_f, lLi);
                DOM.addListener('dragstart', lOnDragStart_f, ai);
                /* if right button clicked menu will
                 * loads and shows
                 */
                DOM.addListener('contextmenu', lOnContextMenu_f, lLi);
                
                /* если ссылка на папку, а не файл */
                if(ai.target !== '_blank'){
                    DOM.addListener('dblclick', lLoadDirOnce, lLi);
                    DOM.addListener('touchend', lLoadDirOnce, lLi);
                }
                
                lLi.id = (ai.title ? ai.title : ai.textContent) +
                    '(' + pPanelID + ')';
            }
        }        
    }
};

/**
 * Функция загружает json-данные о Файловой Системе
 * через ajax-запрос.
 * @param path - каталог для чтения
 * @param pOptions
 * { refresh, nohistory } - необходимость обновить данные о каталоге
 */
CloudCmd._ajaxLoad               = function(pPath, pOptions){
        if(!pOptions)
            pOptions    = {};
        
        /* Отображаем красивые пути */
        
        var lFSPath     = decodeURI(pPath),
            lNOJSPath   = Util.removeStr( lFSPath, '?json' ),
            lCleanPath  = Util.removeStr( lNOJSPath, CloudFunc.FS   ) || '/';
        
        Util.log ('reading dir: "' + lCleanPath + '";');
        
        
        if(!pOptions.nohistory){
            lNOJSPath = lCleanPath === '/' ? '/' : lNOJSPath;
            DOM.setHistory(lNOJSPath, null, lNOJSPath);
        }
        
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
            var lJSON = DOM.Cache.get(pPath);
            
            if (lJSON){
                /* переводим из текста в JSON */
                lJSON = Util.parseJSON(lJSON);
                CloudCmd._createFileTable(lPanel, lJSON, true);
                CloudCmd._changeLinks(lPanel);
            }
            else
                lRet = true;
        }
        
        if(lRet)
            DOM.getCurrentFileContent({
                url     : lFSPath,
                success : function(pData){
                    CloudCmd._createFileTable(lPanel, pData, true);
                    CloudCmd._changeLinks(lPanel);
                    
                    /* переводим таблицу файлов в строку, для   *
                     * сохранения в localStorage                */
                    var lJSON_s = Util.stringifyJSON(pData);
                    Util.log(lJSON_s.length);
                    
                    /* если размер данных не очень бошьой       *
                     * сохраняем их в кэше                      */
                    if(lJSON_s.length < 50000 )
                        DOM.Cache.set(pPath, lJSON_s);
                }
            });
};

/**
 * Функция строит файловую таблицу
 * @param pEleme - родительский элемент
 * @param pJSON  - данные о файлах
 */
CloudCmd._createFileTable        = function(pElem, pJSON, pSetCurrent){
    var lElem           = DOM.getById(pElem),
        /* getting current element if was refresh */
        lPath           = DOM.getByClass('path', lElem),
        lCurrent        = DOM.getCurrentFile(),
        lWasRefresh_b   = lPath[0].textContent === pJSON[0].path;
    
    /* говорим построителю,
     * что бы он в нужный момент
     * выделил строку с первым файлом
     */
    
    /* очищаем панель */
    var i = lElem.childNodes.length;
    while(i--)
        lElem.removeChild(lElem.lastChild);
    
    /* заполняем панель новыми элементами */    
    lElem.innerHTML = CloudFunc.buildFromJSON(pJSON, pSetCurrent);
    
    /* searching current file */
    if(lWasRefresh_b){
        for(i = 0; i < lElem.childNodes.length; i++)
            if(lElem.childNodes[i].textContent === lCurrent.textContent){
                lCurrent = lElem.childNodes[i];
                break;
            }
        DOM.setCurrentFile(lCurrent);
    }
};

/**
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
CloudCmd._getJSONfromFileTable   = function(){
    var lLeft       = DOM.getById('left'),
        lPath       = DOM.getByClass('path')[0].textContent,
        
        lFileTable  = [{
            path:lPath,
            size:'dir'
        }],
        
        lLI         = lLeft.getElementsByTagName('li'),
        
        j = 1;      /* счётчик реальных файлов */
        
    /* счётчик элементов файлов в DOM */
    /* Если путь отличный от корневного
     * второй элемент li - это ссылка на верхний
     * каталог '..'
     */
     
    /* пропускам Path и Header*/
    for(var i = 2, n = lLI.length; i < n; i++){
        var lChildren = lLI[i].children,
            /* file attributes */
            lAttr = {};
        
        /* getting all elements to lAttr object */ 
        for(var l = 0; l < lChildren.length; l++)
            lAttr[lChildren[l].className] = lChildren[l];
        
        /* mini-icon */
        var lIsDir = lAttr['mini-icon directory'] ? true : false,
        
        lName = lAttr.name;
        if(lName)
            lName = DOM.getByTag('a', lName);
        
        /* if found link to folder 
         * cheking is it a full name
         * or short
         */
         /* if short we got title 
         * if full - getting textConent
         */
        if(lName.length)
            lName = lName[0];
            
        lName = lName.title || lName.textContent;
            
        /* если это папка - выводим слово dir вместо размера*/
        var lSize = lIsDir ? 'dir' : lAttr.size.textContent,
            lMode = lAttr.mode.textContent;
        
        /* переводим права доступа в цыфровой вид
         * для хранения в localStorage
         */
        lMode = CloudFunc.convertPermissionsToNumberic(lMode);
        
        lFileTable[ j++ ]={
            name: lName,
            size: lSize,
            mode: lMode
        };
    }
    return Util.stringifyJSON(lFileTable);
};

return CloudCmd;
})(Util, DOM);


DOM.addOneTimeListener('load', function(){
    /* базовая инициализация*/
    CloudCommander.init();
    
    /* загружаем Google Analytics */
    CloudCommander.GoogleAnalytics();
});
