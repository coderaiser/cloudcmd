/* Функция которая возвратит обьект CloudCommander
 * @CloudFunc - обьект содержащий общий функционал
 *  клиентский и серверный
 */

var Util, DOM, CloudFunc, CloudCommander = (function(){
"use strict";

/* Клиентский обьект, содержащий функциональную часть*/
var CloudClient = {
    /* Конструктор CloudClient, который выполняет
     * весь функционал по инициализации
     */
    init                    : null, /* start initialization             */
    
    KeyBinding              : null, /* обьект обработки нажатий клавишь */
    KeysPanel               : null, /* panel with key buttons f1-f8     */
    Config                  : null, /* function loads and shows config  */
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
    _ajaxLoad              : null,
    
    /* Функция генерирует JSON из html-таблицы файлов */
    _getJSONfromFileTable  : null,
    
    /* функция меняет ссыки на ajax-овые */
    _changeLinks           : null,     
    
    /* КОНСТАНТЫ*/
    /* название css-класа текущего файла*/
    CURRENT_FILE           : 'current-file',
    LIBDIR                 : '/lib/',
    LIBDIRCLIENT           : '/lib/client/',
    /* height of Cloud Commander
    * seting up in init()
    */
    HEIGHT                 : 0,
    MIN_ONE_PANEL_WIDTH    : 1155,
    OLD_BROWSER            : false,
    
    HOST                    :  (function(){
        var lLocation = document.location;
        return lLocation.protocol + '//' + lLocation.host;
    })()
};



var cloudcmd = CloudClient,

/* глобальные переменные */
    $, KeyBinding,

/* short names used all the time functions */
    getByClass, getById;


/**
 * function load modules
 * @pParams = {name, path, func, dobefore, arg}
 */
var loadModule                      = function(pParams){
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
    
    if(!cloudcmd[lName])
        cloudcmd[lName] = function(pArg){
            Util.exec(lDoBefore);
            
            return DOM.jsload(cloudcmd.LIBDIRCLIENT + lPath, lFunc ||
                function(){
                    Util.exec(cloudcmd[lName].init, pArg);
                });
        };
};

CloudClient.GoogleAnalytics         = function(){
   /* google analytics */
   var lFunc = document.onmousemove;
   
   document.onmousemove = function(){
        setTimeout(function(){
            DOM.jsload(cloudcmd.LIBDIRCLIENT + 'google_analytics.js');
        },5000);
        
        Util.exec(lFunc);
        
        document.onmousemove = lFunc;
   };
};

/**
 * Функция привязываеться ко всем ссылкам и
 *  загружает содержимое каталогов
 */
CloudClient._loadDir                = function(pLink,pNeedRefresh){
    /* @pElem - элемент, 
     * для которого нужно
     * выполнить загрузку
     */
        return function(pEvent){
            var lRet = true;
            /* показываем гиф загрузки возле пути папки сверху*/
            /* ctrl+r нажата? */
                        
            DOM.Images.showLoad(pNeedRefresh ? {top:true} : null);
            
            var lPanel = DOM.getPanel(),
            /* получаем имя каталога в котором находимся*/ 
                lHref = DOM.getByClass('path', lPanel);
            
            lHref = lHref[0].textContent;
            
            lHref       = CloudFunc.removeLastSlash(lHref);
            var lSubstr = lHref.substr(lHref,lHref.lastIndexOf('/'));
            lHref       = lHref.replace(lSubstr+'/','');
                                     
            /* загружаем содержимое каталога */
            CloudClient._ajaxLoad(pLink, { refresh: pNeedRefresh });
            
            /* получаем все элементы выделенной папки*/
            /* при этом, если мы нажали обновить
             * или <Ctrl>+R - ссылок мы ненайдём
             * и заходить не будем
             */
            var lA = DOM.getCurrentLink(this);
            
            /* если нажали на ссылку на верхний каталог*/
            if(lA && lA.textContent==='..' && lHref!=='/'){
            
            /* функция устанавливает курсор на каталог
             * с которого мы пришли, если мы поднялись
             * в верх по файловой структуре
             */
                CloudClient._currentToParent(lHref);
            }
            
            /* что бы не переходить по ссылкам
             * а грузить всё ajax'ом,
             * возвращаем false на событие
             * onclick
             */
             
             Util.setValue({
                object  : pEvent,
                property: 'returnValue',
                value   : false
            });
             
            return lRet;
        };
    };


/**
 * Function edits file name
 *
 * @param pParent - parent element
 * @param pEvent
 */
CloudClient._editFileName           = function(pParent){
    var lA = DOM.getCurrentLink(pParent);
    
    if (lA && lA.textContent !== '..'){
            
            lA.contentEditable = true;
            KeyBinding.unSet();
            
            var lDocumentOnclick = document.onclick;
            
            /* setting event handler onclick
             * if user clicks somewhere keyBinded
             * backs
             */
            document.onclick = (function(){
                var lA = DOM.getCurrentLink(pParent);
                if (lA && lA.textContent !== '..')
                    lA.contentEditable = false;
                                
                KeyBinding.set();
                
                /* backs old document.onclick 
                 * and call it if it was
                 * setted up earlier
                 */
                document.onclick = lDocumentOnclick;
                
                Util.exec(lDocumentOnclick);
                
            });
    }
};

/**
 * Функция устанавливает текущим файлом, тот
 * на который кликнули единожды
 */
CloudClient._setCurrent             = function(){
        /*
         * @pFromEnter - если мы сюда попали 
         * из события нажатия на энтер - 
         * вызоветься _loadDir
         */
        return function(pFromEnter){
            var lCurrent = DOM.getCurrentFile();
             /* если мы попали сюда с энтера */
             if(pFromEnter===true){
                var lResult = Util.exec( Util.bind(lCurrent.ondblclick, lCurrent) );
                    /*  enter pressed on file */
                if(!lResult){
                    var lA = DOM.getCurrentLink(lCurrent);
                    Util.exec( Util.bind(lA.ondblclick, lCurrent) );
                }
             }/* если мы попали сюда от клика мышки */
             else
                pFromEnter.returnValue = false;
                                       
            /* что бы не переходить по ссылкам
             * а грузить всё ajax'ом,
             * возвращаем false на событие
             * onclick
             */
            return true;
        };
    };
    
/** функция устанавливает курсор на каталог
 * с которого мы пришли, если мы поднялись
 * в верх по файловой структуре
 * @param pDirName - имя каталога с которого мы пришли
 */
CloudClient._currentToParent        = function(pDirName){                                              
    /* опредиляем в какой мы панели:
    * правой или левой
    */
    var lPanel       = DOM.getPanel();

    /* убираем слэш с имени каталога*/
    pDirName = pDirName.replace('/','');
    
    var lRootDir = getById(pDirName + '(' + lPanel.id + ')');
    
    /* if found li element with ID directory name
     * set it to current file
     */
    if(lRootDir){
        DOM.setCurrentFile(lRootDir);
        DOM.scrollIntoViewIfNeeded(lRootDir, true);
    }
};

/** Конструктор CloudClient, который
 * выполняет весь функционал по
 * инициализации
 */
CloudClient.init                    = function(){
    var lFunc = function(){
        Util.loadOnLoad([
            initKeysPanel,
            initModules,
            baseInit
        ]);
    };
    
    getByClass  = DOM.getByClass;
    getById     = DOM.getById;
    
    
    //Util.socketLoad();
    
    if(!document.body.scrollIntoViewIfNeeded){
        this.OLD_BROWSER = true;
            DOM.jsload(CloudClient.LIBDIRCLIENT + 'ie.js',
                function(){
                    DOM.jqueryLoad( lFunc );
                });
    }else
        lFunc();
};

function initModules(pCallBack){
    loadModule({
        /* привязываем клавиши к функциям */
        path  : 'keyBinding.js',
        func : function(){            
            KeyBinding  = cloudcmd.KeyBinding;
            KeyBinding.init();
        }
     });
        
    DOM.ajax({
        url:'/modules.json',
        success: function(pModules){
            var lStorage            = 'storage/',
                lShowLoadFunc       = Util.retFunc( DOM.Images.showLoad ),
                lDisableMenuFunc    = function(){
                    var lFunc = document.oncontextmenu;
                    document.oncontextmenu = function(){
                        Util.exec(lFunc);
                        return cloudcmd.Menu.ENABLED || false;
                    };
                },
                
                lDoBefore           = {
                    'editor/_codemirror'    : lShowLoadFunc,
                    'menu'                  : lDisableMenuFunc,
                    'viewer'                : lShowLoadFunc
                },
                
                lNames               = {};
                lNames[lStorage + '_dropbox'] = 'DropBox',
                lNames[lStorage + '_github' ] = 'GitHub',
                lNames[lStorage + '_gdrive' ] = 'GDrive',
            
            lDisableMenuFunc();
            
            if( Util.isArray(pModules) )
                for(var i = 0, n = pModules.length; i < n ; i++){
                    var lModule = pModules[i];
                    
                    loadModule({
                        path        : lModule,
                        dobefore    : lDoBefore[lModule],
                        name        : lNames[lModule]
                    });
                }
            
            Util.exec(pCallBack);
        }
    });
}

function initKeysPanel(pCallBack){
    var lKeysPanel = {},
    
        lFuncs =[
        null,
        null,                   /* f1 */
        null,                   /* f2 */
        cloudcmd.Viewer,        /* f3 */
        cloudcmd.Editor,        /* f4 */
        null,                   /* f5 */
        null,                   /* f6 */
        null,                   /* f7 */
        DOM.promptRemoveCurrent,/* f8 */
    ];
    
    for(var i = 1; i <= 8; i++){
        var lButton         = 'f' + i,
            lEl             = getById('f' + i);
        
        lEl.onclick         = lFuncs[i];
        lKeysPanel[lButton] = lEl;
    }
    
    cloudcmd.KeysPanel = lKeysPanel;
    Util.exec(pCallBack);
}

function baseInit(pCallBack){
    if(applicationCache){
        var lFunc = applicationCache.onupdateready;
        
        applicationCache.onupdateready = function(){
            console.log('app cacheed');
            location.reload();
            
            Util.exec(lFunc);
        };
    }
    
    /* загружаем общие функции для клиента и сервера                    */
    DOM.jsload(cloudcmd.LIBDIR + 'cloudfunc.js',function(){
        DOM.addListener("popstate", function(pEvent) {
            var lPath   = pEvent.state;
            
            if(lPath)
                cloudcmd._ajaxLoad(lPath, {nohistory: true});
            
            return true;
        });
        
        /* берём из обьекта window общий с сервером функционал          */
        CloudFunc = window.CloudFunc;
        
        /* меняем ссылки на ajax'овые                                   */
        cloudcmd._changeLinks(CloudFunc.LEFTPANEL);
        cloudcmd._changeLinks(CloudFunc.RIGHTPANEL);
                
        /* устанавливаем переменную доступности кэша                    */
        DOM.Cache.isAllowed();
        /* Устанавливаем кэш корневого каталога                         */ 
        if( !DOM.Cache.get('/') )
            DOM.Cache.set('/', cloudcmd._getJSONfromFileTable());
    });
              
    /* устанавливаем размер высоты таблицы файлов
     * исходя из размеров разрешения экрана
     */ 
                 
    /* выделяем строку с первым файлом                                  */
    var lFmHeader = getByClass('fm_header');
    if(lFmHeader && lFmHeader[0].nextSibling)
        DOM.setCurrentFile(lFmHeader[0].nextSibling);
    
    /* показываем элементы, которые будут работать только, если есть js */
    var lFM = getById('fm');
    if(lFM)
        lFM.className='localstorage';
        
    /* формируем и округляем высоту экрана
     * при разрешениии 1024x1280:
     * 658 -> 700
     */
    
    var lHeight = window.screen.height;
        lHeight = lHeight - (lHeight/3).toFixed();
        
    lHeight = (lHeight / 100).toFixed() * 100;
     
    cloudcmd.HEIGHT = lHeight;
     
    DOM.cssSet({id:'cloudcmd',
        inner:
            '.panel{'                           +
                'height:' + lHeight +'px;'      +
            '}'
    });
    
    Util.exec(pCallBack);
    cloudcmd.KeyBinding();
}

CloudClient.getConfig              = function(pCallBack){
    if(!cloudcmd.Config)
        return DOM.ajax({
            url:'/config.json',
            success: function(pConfig){
                cloudcmd.Config = pConfig;
                
                Util.exec(pCallBack, pConfig);
            }
        });
    else
        Util.exec(pCallBack, cloudcmd.Config);
};


/* функция меняет ссыки на ajax-овые */
CloudClient._changeLinks            = function(pPanelID){
    /* назначаем кнопку очистить кэш и показываем её */
    var lClearcache = getById('clear-cache');
    if(lClearcache)
        lClearcache.onclick = DOM.Cache.clear;
    
    /* меняем ссылки на ajax-запросы */
    var lPanel = getById(pPanelID),
        a = lPanel.getElementsByTagName('a'),
        
        /* номер ссылки иконки обновления страницы */
        lREFRESHICON = 0,
        
        /* путь в ссылке, который говорит
        * что js отключен
        */
        lNoJS_s = CloudFunc.NOJS,
        
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
            
            if(Util.isFunction(cloudcmd.Menu) ){
                cloudcmd.Menu({
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
            var lElement = pEvent.target,
                lLink = lElement.href,
                lName = lElement.textContent,        
                /* if it's directory - adding json extension */
                lType = lElement.parentElement.nextSibling;
            
            if(lType && lType.textContent === '<dir>'){
                lLink = lLink.replace(lNoJS_s,'');
                lName += '.json';
            }
            
            pEvent.dataTransfer.setData("DownloadURL",
                'application/octet-stream'  + ':' +
                lName                       + ':' + 
                lLink);
        },
        
        lSetCurrentFile_f = function(pEvent){
            var pElement = pEvent.target,
                lTag = pElement.tagName;
            
            if(lTag !== 'LI')
                do{            
                    pElement = pElement.parentElement;
                    lTag = pElement.tagName;
                }while(lTag !== 'LI');
            
            DOM.setCurrentFile(pElement);
        },
    
        lUrl = cloudcmd.HOST;
    
    for(var i = 0, n = a.length; i < n ; i++)
    {        
        /* убираем адрес хоста*/
        var link = a[i].href.replace(lUrl,'');
        
        /* ставим загрузку гифа на клик*/
        if(i === lREFRESHICON){
            a[i].onclick = CloudClient._loadDir(link, true);
            
            a[i].parentElement.onclick = a[i].onclick;
        }
            
        /* устанавливаем обработчики на строку на одинарное и   *
         * двойное нажатие на левую кнопку мышки                */
        else{
            var lLi = a[i].parentElement.parentElement;
            
            /* if we in path changing onclick events */
            if (lLi.className === 'path') {
                a[i].onclick  = CloudClient._loadDir(link);
            }
            else {
                lLi.onclick     = CloudClient._setCurrent();
                lLi.onmousedown = lSetCurrentFile_f;
                a[i].ondragstart = lOnDragStart_f;
                
                /* if right button clicked menu will
                 * loads and shows
                 */
                lLi.oncontextmenu = lOnContextMenu_f;
                
                /* если ссылка на папку, а не файл */
                if(a[i].target !== '_blank'){
                    lLi.ondblclick  = CloudClient._loadDir(link);
                    
                    DOM.addListener('touchend',
                        CloudClient._loadDir(link),
                        false,
                        lLi
                    );
                }
                
                lLi.id = (a[i].title ? a[i].title : a[i].textContent) +
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
CloudClient._ajaxLoad               = function(pFullPath, pOptions){
        if(!pOptions)
            pOptions = {};
        /* Отображаем красивые пути */        
        /* added supporting of russian  language */
        pFullPath = decodeURI(pFullPath);
        
        var lPath   = pFullPath,
            lFSPath = pFullPath,
            
            lFS_s   = CloudFunc.FS,
            lNoJS_s = CloudFunc.NOJS;
        /* 
         * убираем значения, которые,
         * говорят об отсутствии js
         */          
        if(lPath.indexOf(lNoJS_s) === lFS_s.length){
            lPath = lFSPath =  Util.removeStr(lPath, lNoJS_s);
        }
        
        if(lPath.indexOf(lFS_s) === 0){
            lPath = lPath.replace(lFS_s,'');
            
            if(lPath === '/')
                pFullPath = '/';
        }
        
        console.log ('reading dir: "' + lPath + '";');
        
        
        if(!pOptions.nohistory)
            DOM.setHistory(pFullPath, null, pFullPath);
        
        DOM.setTitle( CloudFunc.getTitle(lPath) );
        
         /* если доступен localStorage и
          * в нём есть нужная нам директория -
          * читаем данные с него и
          * выходим
          * если стоит поле обязательной перезагрузки - 
          * перезагружаемся
          */
         
         /* опредиляем в какой мы панели:
          * правой или левой
          */
        var lPanel = DOM.getPanel().id,
            lError;
         
        if(!pOptions.refresh && lPanel){
            var lJSON = DOM.Cache.get(lPath);
            
            if (lJSON){
                /* переводим из текста в JSON */
                if(window && !window.JSON){
                    lError = Util.tryCatchLog(function(){
                        lJSON = eval('('+lJSON+')');
                    });
                    
                }else
                    lJSON = JSON.parse(lJSON);
                
                CloudClient._createFileTable(lPanel, lJSON);
                CloudClient._changeLinks(lPanel);
                
                
                return;
            }
        }
        
        DOM.ajax({
            url: lFSPath,
            error: DOM.Images.showError,
            
            success:function(data, textStatus, jqXHR){                                            
                /* если такой папки (или файла) нет
                 * прячем загрузку и показываем ошибку
                 */                 
                if(!jqXHR.responseText.indexOf('Error:'))
                    return DOM.showError(jqXHR);

                CloudClient._createFileTable(lPanel, data);
                CloudClient._changeLinks(lPanel);
                                                            
                /* Сохраняем структуру каталогов в localStorage,
                 * если он поддерживаеться браузером
                 */
                /* переводим таблицу файлов в строку, для
                * сохранения в localStorage
                */
                var lJSON_s = JSON.stringify(data);
                console.log(lJSON_s.length);
                
                /* если размер данных не очень бошьой
                * сохраняем их в кэше
                */
                if(lJSON_s.length < 50000 )
                    DOM.Cache.set(lPath, lJSON_s);
            }
        });
};

/**
 * Функция строит файловую таблицу
 * @param pEleme - родительский элемент
 * @param pJSON  - данные о файлах
 */
CloudClient._createFileTable        = function(pElem, pJSON){    
    var lElem = getById(pElem);
    
    /* getting current element if was refresh */
    var lPath = getByClass('path', lElem);
    var lWasRefresh_b = lPath[0].textContent === pJSON[0].path;
    var lCurrent;    
    if(lWasRefresh_b)
        lCurrent = DOM.getCurrentFile();
            
    /* говорим построителю,
     * что бы он в нужный момент
     * выделил строку с первым файлом
     */
    
    /* очищаем панель */
    var i = lElem.childNodes.length;
    while(i--)
        lElem.removeChild(lElem.lastChild);
    
    /* заполняем панель новыми элементами */    
    lElem.innerHTML = CloudFunc.buildFromJSON(pJSON,true);
    
    /* searching current file */
    if(lWasRefresh_b && lCurrent){
        for(i = 0; i < lElem.childNodes.length; i++)
            if(lElem.childNodes[i].textContent === lCurrent.textContent){
                lCurrent = lElem.childNodes[i];
                break;
            }
        DOM.setCurrentFile(lCurrent);
        //lCurrent.parentElement.focus();
    }
};

/**
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
CloudClient._getJSONfromFileTable   = function(){
    var lLeft       = getById('left'),
        lPath       = getByClass('path')[0].textContent,
        
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
    return JSON.stringify(lFileTable);
};

return CloudClient;
})();

window.onload = function(){
    'use strict';
    
    /* базовая инициализация*/
    CloudCommander.init();
    
    /* загружаем Google Analytics */
    CloudCommander.GoogleAnalytics();
};
