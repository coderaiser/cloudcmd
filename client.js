/* Функция которая возвратит обьект CloudCommander
 * @window - обьект window
 * @document - обьект document
 * @CloudFunc - обьект содержащий общий функционал
 *              клиентский и серверный
 */

var CloudCommander = (function(){
"use strict";

/* Клиентский обьект, содержащий функциональную часть*/
var CloudClient = {        
    /* Конструктор CloudClient, который выполняет
     * весь функционал по инициализации
     */
    init                    : null, /* start initialization             */
    
    KeyBinding              : null, /* обьект обработки нажатий клавишь */
    Config                  : null, /* function loads and shows config  */
    Editor                  : null, /* function loads and shows editor  */
    Viewer                  : null, /* function loads and shows viewer  */
    Terminal                : null, /* function loads and shows terminal*/
    Menu                    : null, /* function loads and shows menu    */
    GoogleAnalytics         : null,
            
    _loadDir                : null, /* Функция привязываеться ко всем
                                     * ссылкам и
                                     * загружает содержимое каталогов */
    
    /* ОБЬЕКТЫ */
    /* Обьект для работы с кэшем */
    Cache                  : {},
    /* Object contain additional system functional */
    Util                   : {},
    
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
    OLD_BROWSER            : false
};



var cloudcmd = CloudClient;

/* глобальные переменные */
var CloudFunc, $, Util, KeyBinding,
/* short names used all the time functions */
    getByClass, getById;

/* 
 * Обьект для работы с кэшем
 * в него будут включены функции для
 * работы с LocalStorage, webdb,
 * indexed db etc.
 */
CloudClient.Cache = {
    _allowed     : true,     /* приватный переключатель возможности работы с кэшем */
    
    /* функция проверяет возможно ли работать с кэшем каким-либо образом */
    isAllowed   : function(){},
    
    /* Тип кэша, который доступен*/
    type        : {},
    
    /* Функция устанавливает кэш, если выбранный вид поддерживаеться браузером*/
    set         :function(){},
    
    /* Функция достаёт кэш, если выбранный вид поддерживаеться браузером*/
    get         : function(){},
    
    /* функция чистит весь кэш для всех каталогов*/
    clear       : function(){}
};


/* функция проверяет поддерживаеться ли localStorage */
CloudClient.Cache.isAllowed = (function(){
    if(window.localStorage   && 
        localStorage.setItem &&
        localStorage.getItem){
        CloudClient.Cache._allowed=true;
    }else
        {
            CloudClient.Cache._allowed=false;
            /* загружаем PolyFill для localStorage,
             * если он не поддерживаеться браузером
             * https://gist.github.com/350433 
             */
            /*
            Util.jsload('https://raw.github.com/gist/350433/c9d3834ace63e5f5d7c8e1f6e3e2874d477cb9c1/gistfile1.js',
                function(){CloudClient.Cache._allowed=true;
            });
            */
        }
});
 /* если доступен localStorage и
  * в нём есть нужная нам директория -
  * записываем данные в него
  */
CloudClient.Cache.set   = (function(pName, pData){
    if(CloudClient.Cache._allowed && pName && pData){
        localStorage.setItem(pName,pData);
    }
});
/* Если доступен Cache принимаем из него данные*/
CloudClient.Cache.get   = (function(pName){
    if(CloudClient.Cache._allowed  && pName){
        return localStorage.getItem(pName);
    }
    else return null;
});
/* Функция очищает кэш*/
CloudClient.Cache.clear = (function(){
    if(CloudClient.Cache._allowed){
        localStorage.clear();
    }
});

/* Object contain additional system functional */
CloudClient.Util        = (function(){
    
    /* Load file countent thrue ajax
     */
    var lXMLHTTP;
    
    this.addClass               = function(pElement, pClass){
        var lClassList = pElement.classList;
        if(lClassList)
            lClassList.add(pClass);
        else{
            var lSpaceChar = '';
            if(pElement.className)
                lSpaceChar = ' ';
            pElement.className += lSpaceChar + 'hidden';
        }
    };
    
    this.ajax                   = function(pParams){
        /* if on webkit
         */
        if(window.XMLHttpRequest){
            if(!lXMLHTTP)
                lXMLHTTP = new XMLHttpRequest();
            
            var lMethod = 'GET';
            if(pParams.method)
                lMethod = pParams.method;
            
            lXMLHTTP.open(lMethod, pParams.url, true);
            lXMLHTTP.send(null);
            
            var lSuccess_f = pParams.success;
            if(typeof lSuccess_f !== 'function')
            console.log('error in Util.ajax onSuccess:', pParams);
            
            lXMLHTTP.onreadystatechange = function(pEvent){                
                if (lXMLHTTP.readyState === 4 /* Complete */){
                    var lJqXHR = pEvent.target;
                    var lContentType = lXMLHTTP.getResponseHeader('content-type');
                    
                    if (lXMLHTTP.status     === 200 /* OK */){                        
                        var lData = lJqXHR.response;
                        
                        /* If it's json - parse it as json */                        
                        if(lContentType &&
                            lContentType.indexOf('application/json') === 0){
                                try{
                                    lData = JSON.parse(lJqXHR.response);
                                }
                                catch(pError) {
                                    /* if could not parse */
                                    console.log('Error: could not parse' +
                                        'json from server from url: '    +
                                        pParams.url);
                                    
                                    lData = lJqXHR.response;
                                }
                            }
                        
                        lSuccess_f(lData, lJqXHR.statusText, lJqXHR);
                    }
                    else/* file not found or connection lost */{
                        var lError_f = pParams.error;
                        
                        /* if html given or something like it
                         * getBack just status of result
                         */
                        if(lContentType &&
                            lContentType.indexOf('text/plain') !== 0){
                                lJqXHR.responseText = lJqXHR.statusText;
                        }
                        
                        if(typeof lError_f === 'function')
                            lError_f(lJqXHR);
                    }
                }
            };
        }
        else $.ajax(pParams);
    };
    
    /* setting function context (this) */
    this.bind                   = function(pFunction, pContext){
        return pFunction.bind(pContext);
    };
    
    /*
     * Function gets id by src
     * from http://domain.com/1.js to
     * 1_js
     */
    this.getIdBySrc             = function(pSrc){
        var lID = pSrc.replace(pSrc.substr(pSrc,
                    pSrc.lastIndexOf('/')+1),
                    '');
        
        /* убираем точки */
        while(lID.indexOf('.') > 0)
            lID = lID.replace('.','_');
        
        return lID;
    },
    
    this.loadOnload             = function(pFunc_a){
        if(pFunc_a instanceof Array) {
                
                var lFunc_f = pFunc_a.pop();
                
                if(typeof lFunc_f === 'function')
                    lFunc_f();
                    
                return this.loadOnload(pFunc_a);
        }
        else if(typeof pFunc_a === 'function')                    
            return pFunc_a();
    };
    
    this.anyLoadOnload          = function(pParams_a){
        if(pParams_a instanceof Array) {
                
                var lParams_o = pParams_a.pop();
                            
                if(!lParams_o.func)
                    lParams_o.func = function(){                    
                        lThis.anyLoadOnload(pParams_a);  
                    };
                                        
                return this.anyload(lParams_o);
        }
    };
    
    /* 
     * Функция создаёт элемент и
     * загружает файл с src.
     * @pName       - название тэга
     * @pSrc        - путь к файлу
     * @pFunc       - обьект, содержаий одну из функций
     *                  или сразу две onload и onerror
     *                  {onload: function(){}, onerror: function();}
     * @pStyle      - стиль
     * @pId         - id
     * @pElement    - элемент, дочерним которо будет этот
     * @pParams_o = {name: '', src: ' ',func: '', style: '', id: '', parent: '',
        async: false, inner: 'id{color:red, }, class:'', not_append: false}
     */
    this.anyload                = function(pParams_o){
        /* if a couple of params was
         * processing every of params
         * and quit
         */
        if(pParams_o instanceof Array){
            var lElements_a = [];
            for(var i=0; i < pParams_o.length; i++)
                lElements_a[i] = this.anyload(pParams_o[i]);
            
            return lElements_a;
        }
        
        /* убираем путь к файлу, оставляя только название файла */
        var lID     = pParams_o.id;
        var lClass  = pParams_o.className;
        var lSrc    = pParams_o.src;
        var lFunc   = pParams_o.func;
        var lAsync  = pParams_o.async;
        
        if(!lID && lSrc)
            lID = this.getIdBySrc(lSrc);
        
        var element = getById(lID);
        /* если скрипт еще не загружен */
        if(!element)
        {
            if(!pParams_o.name)
                return {code: -1, text: 'name can not be empty'};
            
            element     = document.createElement(pParams_o.name);
            
            if(lID)
                element.id  = lID;
            
            if(lClass)
                element.className = lClass;
            /* if working with external css
             * using href in any other case
             * using src
             */
            pParams_o.name === 'link' ? 
                  ((element.href = lSrc) && (element.rel = 'stylesheet'))
                : element.src  = lSrc;
                        
            /* if passed arguments function
             * then it's onload by default
             */        
            if(pParams_o.func)
                if(typeof lFunc === 'function'){
                    element.onload = lFunc;
                    /*
                    element.onreadystatechange = function(){
                        if(this.readyState === 'loaded')
                            lFunc();
                    };*/ /* ie */

                /* if object - then onload or onerror */
                }else if (typeof lFunc === 'object') {
                    if(lFunc.onload &&
                        typeof lFunc.onload === 'function'){
                            element.onload   = lFunc.onload;
                            /*
                            element.onreadystatechange = function(){
                                if(this.readyState === 'loaded')
                                lFunc();
                            };*/ /* ie */                            
                        }
                }
                
            /* if element (js/css) will not loaded
             * it would be removed from DOM tree
             * and error image would be shown
             */
            element.onerror = (function(){
                    (pParams_o.parent || document.body)
                        .removeChild(element);
                                        
                    Util.Images.showError({
                        responseText: 'file ' +
                        lSrc                  +
                        ' could not be loaded',
                        status : 404
                    });
                    
                    if(lFunc && lFunc.onerror &&
                        typeof lFunc.onerror === 'function')
                            lFunc.onerror();
            });
            
            if(pParams_o.style){
                element.style.cssText=pParams_o.style;
            }
                        
            if(lAsync || lAsync === undefined)
                element.async = true;
            
            if(!pParams_o.not_append)
                (pParams_o.parent || document.body).appendChild(element);
                                    
            if(pParams_o.inner){
                element.innerHTML = pParams_o.inner;
            }
        }
        /* если js-файл уже загружен 
         * запускаем функцию onload
         */
        else if(lFunc){
            if(typeof lFunc === 'function')
                lFunc();
            
            else if(typeof lFunc === 'object' && 
                typeof lFunc.onload === 'function')
                    lFunc.onload();
        
        }
        return element;
    },

    /* Функция загружает js-файл */
    this.jsload                 = function(pSrc, pFunc){
        if(pSrc instanceof Array){
            for(var i=0; i < pSrc.length; i++)
                pSrc[i].name = 'script';
            
            return this.anyload(pSrc);
        }
            
        return this.anyload({
            name : 'script',
            src  : pSrc,
            func : pFunc
        });
    },
    
    /* Функция создаёт елемент style и записывает туда стили 
 * @pParams_o - структура параметров, заполняеться таким
 * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
 * все параметры опциональны
 */
        
    this.cssSet                 = function(pParams_o){
        pParams_o.name      = 'style';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return this.anyload(pParams_o);                
    },
    /* Function loads external css files 
     * @pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */
    this.cssLoad                = function(pParams_o){
         if(pParams_o instanceof Array){
            for(var i=0; i < pParams_o.length; i++){
                pParams_o[i].name = 'link';
                pParams_o[i].parent   = pParams_o.parent || document.head;                
            }
            
            return this.anyload(pParams_o);
        }
        
        pParams_o.name      = 'link';
        pParams_o.parent   = pParams_o.parent || document.head;

        return this.anyload(pParams_o);
    };
    
    this.jqueryLoad             = function(pCallBack){
        /* загружаем jquery: */
        Util.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js',{
            onload: function(){
                $ = window.jQuery;
                if(typeof pCallBack === 'function')
                    pCallBack();
            },
            
            onerror: function(){
                Util.jsload('lib/client/jquery.js');
                
                /*
                 * if could not load jquery from google server
                 * maybe we offline, load font from local
                 * directory
                 */
                Util.cssSet({id:'local-droids-font',
                    element : document.head,
                    inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                                'font-style: normal;font-weight: normal;'               +
                                'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                                ' url("font/DroidSansMono.woff") format("woff");}'
                });                   
            }
        });
    };
        
    this.getByTag               = function(pTag, pElement){
        return (pElement || document).getElementsByTagName(pTag);
    };
    
    this.getById                = function(pId, pElement){
        return (pElement || document).getElementById(pId);
    };
    
    
    /*
     * Function search element by class name
     * @pClass - className
     * @pElement - element
     */
    this.getByClass             = function(pClass, pElement){
        return (pElement || document).getElementsByClassName(pClass);            
    };
            
    /* private members */
    var lLoadingImage;
    var lErrorImage;
    
    /* Обьект, который содержит
     * функции для отображения
     * картинок
     */
    var LImages_o               = {            
        /* Функция создаёт картинку загрузки*/
        loading : function(){    
            var lE = Util.getById('loading-image');
            if (!lE)
                lE = Util.anyload({
                    name        : 'span',
                    className   : 'icon loading',
                    id          : 'loading-image',
                    not_append  : true
                });
            
            lLoadingImage = lE;
        
            return lE;
        },
    
        /* Функция создаёт картинку ошибки загрузки*/
        error : function(){
            var lE = Util.getById('error-image');
            if (!lE)
                lE = Util.anyload({
                    name        : 'span',
                    className   : 'icon error',
                    id          : 'error-image',
                    not_append  : true
                });
            
            return lE;
        }
    };
            
    var lThis = this;
    this.Images                 = {
        /* 
         * Function shows loading spinner
         * @pElem - top element of screen
         * pPosition = {top: true};
         */   
        showLoad        : function(pPosition){
            var lRet_b = true;
            
            lLoadingImage   = LImages_o.loading();
            lErrorImage     = LImages_o.error();
            
            Util.hide(lErrorImage);
            
            var lCurrent;        
            if(pPosition){
                if(pPosition.top){
                    lCurrent    = lThis.getRefreshButton();                    
                    if(lCurrent)
                        lCurrent = lCurrent.parentElement;
                    else
                        lRet_b  = false;
                }
            }
            else
            {
                lCurrent    = lThis.getCurrentFile();
                lCurrent    = lCurrent.firstChild.nextSibling;
            }
                                 
            /* show loading icon
             * if it not showed  
             * and if error was not
             * heppen
             */
            if(lRet_b){
                var lParent = lLoadingImage.parentElement;
                if(!lParent ||
                    (lParent && lParent !== lCurrent))
                        lCurrent.appendChild(lLoadingImage);
                
                Util.show(lLoadingImage); /* показываем загрузку*/
            }
            
            return lRet_b;
        },
    
        hideLoad        : function(){
            lLoadingImage = LImages_o.loading();                
            Util.hide(lLoadingImage);
        },
        
        showError       : function(jqXHR, textStatus, errorThrown){
            lLoadingImage = LImages_o.loading();
            
            lErrorImage = LImages_o.error();
                        
            var lText;
            if(jqXHR.status === 404)
                lText = jqXHR.responseText;            
            else
                lText = jqXHR.statusText;
            
            /* если файла не существует*/
            if(!lText.indexOf('Error: ENOENT, '))
                lText = lText.replace('Error: ENOENT, n','N');
            
            /* если не хватает прав для чтения файла*/
            else if(!lText.indexOf('Error: EACCES,'))
                lText = lText.replace('Error: EACCES, p','P');                            
            
            Util.show(lErrorImage);
            lErrorImage.title = lText;
            
            var lParent = lLoadingImage.parentElement;
            if(lParent)
                lParent.appendChild(lErrorImage);
            
            Util.hide(lLoadingImage);
            
            console.log(lText);
        }
    };
    
    this.getCurrentFile         = function(){
        var lCurrent = lThis.getByClass(CloudCommander.CURRENT_FILE)[0];
        if(!lCurrent)
            this.addCloudStatus({
                code : -1,
                msg  : 'Error: can not find '  +
                        'CurrentFile '         +
                        'in getCurrentFile'
            });
        
        return lCurrent;
    };
    
    this.getRefreshButton       = function(){                
        var lPanel      = this.getPanel();
        var lRefresh    = this.getByClass(CloudFunc.REFRESHICON, lPanel);
                        
        if (lRefresh.length)                
            lRefresh = lRefresh[0];
        else {
            this.addCloudStatus({
                code : -3,
                msg  : 'Error Refresh icon not found'
                });
            lRefresh = false;
        }
        
        return lRefresh;
    };
    
    this.setCurrentFile         = function(pCurrentFile){
        var lRet_b = true;
        
        if(!pCurrentFile){
            this.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  +
                        'setCurrentFile'        +
                        'could not be none'
            });
            
            lRet_b = false;
        }
        var lCurrentFileWas = this.getCurrentFile();
                        
        if (pCurrentFile.className === 'path')
            pCurrentFile = pCurrentFile.nextSibling;
        
        if (pCurrentFile.className === 'fm_header')
            pCurrentFile = pCurrentFile.nextSibling;
        
        if(lCurrentFileWas)
            lUnSetCurrentFile(lCurrentFileWas);
            
        var lCurrentClass = CloudCommander.CURRENT_FILE;

        this.addClass(pCurrentFile, lCurrentClass);
        
        /* scrolling to current file */
        Util.scrollIntoViewIfNeeded(pCurrentFile);
        
        return  lRet_b;
    };
    
    var lUnSetCurrentFile       = function(pCurrentFile){
        if(!pCurrentFile)
            Util.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  +
                        'unSetCurrentFile'        +
                        'could not be none'
            });
        
        var lRet_b = Util.isCurrentFile(pCurrentFile);
        var lCurrentClass = CloudCommander.CURRENT_FILE;        

        if(lRet_b)            
            Util.removeClass(pCurrentFile, lCurrentClass);                    
        
        return lRet_b;
    };
    
    this.isCurrentFile          = function(pCurrentFile){
        if(!pCurrentFile)
            this.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  + 
                        'isCurrentFile'         +
                        'could not be none'
            });
        
        var lCurrentClass       = CloudCommander.CURRENT_FILE;
        var lCurrentFileClass   = pCurrentFile.className;
        
        return ( lCurrentFileClass.indexOf(lCurrentClass) >= 0 );
    };
    
    this.getCurrentLink         = function(pCurrentFile){                
        var lLink;
        if(pCurrentFile)
            lLink = this.getByTag('a', pCurrentFile)[0];
        else{
            var lCurrentFile = this.getCurrentFile();
            lLink = this.getByTag('a', lCurrentFile)[0];
        }
            
        if(!lLink)
            this.addCloudStatus({
                code : -1,
                msg  : 'Error current element do not contain links'
            });
        
        return lLink; 
    };
    
    this.getCurrentName         = function(pCurrentFile){
        var lCurrent = this.getCurrentFile();
                
        var lLink;
        lLink = this.getCurrentLink(pCurrentFile ? pCurrentFile : lCurrent);
            
        if(!lLink)
            this.addCloudStatus({
                code : -1,
                msg  : 'Error current element do not contain links'
            });
        else lLink = lLink.textContent;
        
        return lLink; 
    };
    
    /* function getting panel active, or passive
     * @pPanel_o = {active: true}
      */
    this.getPanel               = function(pActive){
        var lPanel;
        
        lPanel = lThis.getCurrentFile().parentElement;
                            
        /* if {active : false} getting passive panel */
        if(pActive && !pActive.active){
            var lId = lPanel.id === 'left' ? 'right' : 'left';
            lPanel = lThis.getById(lId);
        }
        
        /* if two panels showed
         * then always work with passive
         * panel
         */
        if(window.innerWidth < CloudCommander.MIN_ONE_PANEL_WIDTH)
            lPanel = lThis.getById('left');
            
        
        if(!lPanel)
            console.log('Error can not find Active Panel');
        
        return lPanel;
    };
    
    this.show                   = function(pElement){
        Util.removeClass(pElement, 'hidden');
    };
    
    this.showPanel              = function(pActive){
        var lPanel = lThis.getPanel(pActive);
                        
        if(lPanel)
            this.show(lPanel);
    };
    
    this.hidePanel              = function(pActive){
        var lPanel = lThis.getPanel(pActive);
        
        if(lPanel)
            this.hide(lPanel);
    };
    
    this.hide                   = function(pElement){
        return this.addClass(pElement, 'hidden');   
    };
    
    this.removeClass            = function(pElement, pClass){
        if(pElement.classList)
           pElement.classList.remove(pClass);
           
        else if(pElement.className.length > pClass.length)
            pElement.className = pElement.className.replace(pClass, '');
    };
    
    this.removeCurrent          = function(pCurrent){
        var lParent = pCurrent.parentElement;
        
        if(!pCurrent)
            pCurrent = this.getCurrentFile();
        var lName = this.getCurrentName(pCurrent);
        
        if(pCurrent && lParent){
            if(lName !== '..'){
                var lNext       = pCurrent.nextSibling;
                var lPrevious   = pCurrent.previousSibling;
                if(lNext)
                    Util.setCurrentFile(lNext);
                else if(lPrevious)
                    Util.setCurrentFile(lPrevious);
                            
                lParent.removeChild(pCurrent);
            }
            else 
                this.addCloudStatus({
                    code : -1,
                    msg  : 'Could not remove parrent dir'
                });
        }
        else
            this.addCloudStatus({
                code : -1,
                msg  : 'Current file (or parent of current) could not be empty'
            });
            
        return pCurrent;
    };
    
    this.scrollIntoViewIfNeeded = function(pElement){
        var lOk = true;
        if(pElement && pElement.scrollIntoViewIfNeeded)
            pElement.scrollIntoViewIfNeeded();
        else lOk = false;
        
        return lOk;
    };
    
    
    this.CloudStatus = [];
    
    this.addCloudStatus = function(pStatus){
        this.CloudStatus[this.CloudStatus.length] = pStatus;
    };
});

CloudClient.Util       = new CloudClient.Util();

/* функция обработки нажатий клавишь */
CloudClient.KeyBinding = (function(){
    /* loading keyBinding module and start it */
    Util.jsload(CloudClient.LIBDIRCLIENT+'keyBinding.js', function(){
        cloudcmd.KeyBinding.init();
        
        KeyBinding  = cloudcmd.KeyBinding;
    });
});

/* function loads and shows editor */
CloudClient.Editor = (function(pCurrentFile, pIsReadOnly) {    
    /* loading CloudMirror plagin */    
    Util.jsload(CloudClient.LIBDIRCLIENT +
        'editor/_codemirror.js',{
        //'editor/_ace.js',{
            onload:(function(){
                cloudcmd.Editor.Keys(pCurrentFile, pIsReadOnly);
            })
    });
});


CloudClient.Config = (function() {
    Util.Images.showLoad({top: true});
    Util.jsload(CloudClient.LIBDIRCLIENT +
        'config.js',{
        onload: function(){
            cloudcmd.Config.Keys();
        }
    });
});

CloudClient.GoogleAnalytics = (function(){
   /* google analytics */
   var lFunc = document.onmousemove;
   document.onmousemove = function(){       
        setTimeout(function(){
            Util.jsload('lib/client/google_analytics.js');
        },5000);
        
        if(typeof lFunc === 'function')
            lFunc();
        
        document.onmousemove = lFunc;
   };
});

/* function loads and shows viewer */
CloudClient.Viewer = (function(pCurrentFile){
    Util.jsload(CloudClient.LIBDIRCLIENT + 
        'viewer.js',{
            onload: (function(){
                cloudcmd.Viewer.Keys(pCurrentFile);
            })
    });
});

/* function loads and shows terminal */
CloudClient.Terminal = (function(){
    Util.jsload(CloudClient.LIBDIRCLIENT + 
        'terminal.js',{
            onload: (function(){
                cloudcmd.Terminal.Keys();
            })
    });
});

/* function loads and shows menu 
 * @pPosition - coordinates of menu {x, y}
 */
CloudClient.Menu = (function(pPosition){
    Util.jsload(CloudClient.LIBDIRCLIENT + 
        'menu.js',{
            onload: (function(){
                cloudcmd.Menu.Keys(pPosition);
            })
    });
});

/* 
 * Функция привязываеться ко всем ссылкам и
 *  загружает содержимое каталогов
 */
CloudClient._loadDir = (function(pLink,pNeedRefresh){
    /* @pElem - элемент, 
     * для которого нужно
     * выполнить загрузку
     */
        return function(){
            /* показываем гиф загрузки возле пути папки сверху*/
            /* ctrl+r нажата? */
                        
            Util.Images.showLoad(pNeedRefresh ? {top:true} : null);
            
            var lPanel = Util.getPanel();
            /* получаем имя каталога в котором находимся*/ 
            var lHref = Util.getByClass('path', lPanel);
            lHref = lHref[0].textContent;
            
            lHref       = CloudFunc.removeLastSlash(lHref);
            var lSubstr = lHref.substr(lHref,lHref.lastIndexOf('/'));
            lHref       = lHref.replace(lSubstr+'/','');
                                     
            /* загружаем содержимое каталога */
            CloudClient._ajaxLoad(pLink, pNeedRefresh);
            
            /* получаем все элементы выделенной папки*/
            /* при этом, если мы нажали обновить
             * или <Ctrl>+R - ссылок мы ненайдём
             * и заходить не будем
             */
            var lA = Util.getCurrentLink(this);
            
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
            return false;
            };
    });
    

/*
 * Function edits file name
 *
 * @pParent - parent element
 * @pEvent
 */
CloudClient._editFileName = (function(pParent){
    var lA = Util.getCurrentLink(pParent);
    
    if (lA && lA.textContent !== '..'){
            
            lA.contentEditable = true;
            KeyBinding.unSet();
            
            var lDocumentOnclick = document.onclick;
            
            /* setting event handler onclick
             * if user clicks somewhere keyBinded
             * backs
             */
            document.onclick = (function(){
                var lA = Util.getCurrentLink(pParent);
                if (lA && lA.textContent !== '..')
                    lA.contentEditable = false;
                                
                KeyBinding.set();
                
                /* backs old document.onclick 
                 * and call it if it was
                 * setted up earlier
                 */
                document.onclick = lDocumentOnclick;
                if(typeof lDocumentOnclick === 'function')
                    lDocumentOnclick();
                
            });
    }
});

/* Функция устанавливает текущим файлом, тот
 * на который кликнули единожды
 */
CloudClient._setCurrent=(function(){
        /*
         * @pFromEnter - если мы сюда попали 
         * из события нажатия на энтер - 
         * вызоветься _loadDir
         */
        return function(pFromEnter){
            var lCurrentFile = Util.getCurrentFile();
            if(lCurrentFile){                        
                if (Util.isCurrentFile(this)  &&
                    typeof pFromEnter !== 'boolean'){
                    //var lParent = this;
                    
                    //setTimeout(function(){
                        /* waiting a few seconds
                         * and if classes still equal
                         * make file name editable
                         * in other case
                         * double click event happend
                         */
                    //    if(Util.getCurrentFile() === lParent)
                     //       CloudClient._editFileName(lParent);
                     //   },1000);
                }
                else{                        
                    /* устанавливаем курсор на файл,
                    * на который нажали */
                    Util.setCurrentFile(this);
                }
            }
             /* если мы попали сюда с энтера*/
             if(pFromEnter===true){
                if(typeof this.ondblclick === 'function')
                    this.ondblclick(this);
                    /*  enter pressed on file */
                else{
                    var lA = this.getElementsByTagName('a')[0];
                    if(typeof lA.ondblclick === 'function')
                        lA.ondblclick(this);
                }
             }/* если мы попали сюда от клика мышки */
             else{pFromEnter.returnValue=false;}
                                       
            /* что бы не переходить по ссылкам
             * а грузить всё ajax'ом,
             * возвращаем false на событие
             * onclick
             */
            return false;
        };
    });
    
/* функция устанавливает курсор на каталог
 * с которого мы пришли, если мы поднялись
 * в верх по файловой структуре
 * @pDirName - имя каталога с которого мы пришли
 */
CloudClient._currentToParent = (function(pDirName){                                              
    /* опредиляем в какой мы панели:
    * правой или левой
    */
    var lPanel       = Util.getPanel();

    /* убираем слэш с имени каталога*/
    pDirName = pDirName.replace('/','');
    
    var lRootDir = getById(pDirName + '(' + lPanel.id + ')');
    
    /* if found li element with ID directory name
     * set it to current file
     */
    if(lRootDir){
        Util.setCurrentFile(lRootDir);
        Util.scrollIntoViewIfNeeded(lRootDir, true);
    }
}); 

/* Конструктор CloudClient, который
 * выполняет весь функционал по
 * инициализации
 */
CloudClient.init = (function(){
    Util        = cloudcmd.Util;
    KeyBinding  = cloudcmd.KeyBinding;
    getByClass  = Util.getByClass;
    getById     = Util.getById;
    
    if(!document.body.scrollIntoViewIfNeeded){
        this.OLD_BROWSER = true;
            Util.jsload(CloudClient.LIBDIRCLIENT + 'ie.js',
                function(){
                    Util.jqueryLoad(CloudClient.baseInit);
                });
    }
    else CloudClient.baseInit();
});

CloudClient.baseInit = (function(){
    if(applicationCache){
        var lFunc = applicationCache.onupdateready;
        applicationCache.onupdateready = function(){
            console.log('app cacheed');
            location.reload();
            if(typeof lFunc === 'function')
                lFunc();
        };
    }
    /* меняем title 
     * если js включен - имена папок отображать необязательно...
     * а может и обязательно при переходе, можно будет это сделать
     */
    var lTitle = Util.getByTag('title');
    if(lTitle.length > 0)
        lTitle[0].textContent = 'Cloud Commander';
           
    /* загружаем общие функции для клиента и сервера                    */
    Util.jsload(CloudClient.LIBDIR+'cloudfunc.js',function(){
        /* берём из обьекта window общий с сервером функционал          */
        CloudFunc=window.CloudFunc;
        
        /* меняем ссылки на ajax'овые                                   */
        CloudClient._changeLinks(CloudFunc.LEFTPANEL);
        CloudClient._changeLinks(CloudFunc.RIGHTPANEL);
                
        /* устанавливаем переменную доступности кэша                    */
        CloudClient.Cache.isAllowed();    
        /* Устанавливаем кэш корневого каталога                         */ 
        if(!CloudClient.Cache.get('/'))
            CloudClient.Cache.set('/', CloudClient._getJSONfromFileTable());
    });
              
    /* устанавливаем размер высоты таблицы файлов
     * исходя из размеров разрешения экрана
     */ 
                 
    /* выделяем строку с первым файлом                                  */
    var lFmHeader = getByClass('fm_header');
    if(lFmHeader && lFmHeader[0].nextSibling)
        Util.setCurrentFile(lFmHeader[0].nextSibling);
    
    /* показываем элементы, которые будут работать только, если есть js */
    var lFM = getById('fm');
    if(lFM)
        lFM.className='localstorage';
        
    /* формируем и округляем высоту экрана
     * при разрешениии 1024x1280:
     * 658 -> 700
     */                            
    
    var lHeight = 
        window.screen.height - 
        (window.screen.height/3).toFixed();
        
    lHeight=(lHeight/100).toFixed()*100;
     
    CloudClient.HEIGHT = lHeight;
     
    Util.cssSet({id:'cloudcmd',
        element:document.head,
        inner:
            '.panel{'                           +
                'height:' + lHeight +'px;'      +
            '}'
    });
});

/* функция меняет ссыки на ajax-овые */
CloudClient._changeLinks = function(pPanelID){
    /* назначаем кнопку очистить кэш и показываем её */
    var lClearcache = getById('clear-cache');
    if(lClearcache)
        lClearcache.onclick = CloudClient.Cache.clear;    
    
    /* меняем ссылки на ajax-запросы */
    var lPanel = getById(pPanelID);
    var a = lPanel.getElementsByTagName('a');
    
    /* номер ссылки иконки обновления страницы */
    var lREFRESHICON = 0;
        
     /* путь в ссылке, который говорит
      * что js отключен
      */
    var lNoJS_s = CloudFunc.NOJS; 
    var lFS_s   = CloudFunc.FS;
    
    /* right mouse click function varible */
    var lOnContextMenu_f = function(pEvent){
        var lReturn_b = true;
        
        KeyBinding.unSet();
        
        /* getting html element
         * currentTarget - DOM event
         * target        - jquery event
         */
        var lTarget = pEvent.currentTarget || pEvent.target;        
        Util.setCurrentFile(lTarget);
        
        if(typeof CloudCommander.Menu === 'function'){            
            CloudCommander.Menu({
                x: pEvent.x,
                y: pEvent.y
            });
            
            /* disabling browsers menu*/
            lReturn_b = false;
            Util.Images.showLoad();
        }        
        
        return lReturn_b;
    };
    
    /* drag and drop function varible
     * download file from browser to descktop
     * in Chrome (HTML5)
     */
    var lOnDragStart_f = function(pEvent){
        var lElement = pEvent.target;
                
        var lLink = lElement.href;
        var lName = lElement.textContent;
        
        /* if it's directory - adding json extension */
        var lType = lElement.parentElement.nextSibling;
        if(lType && lType.textContent === '<dir>'){
            lLink = lLink.replace(lNoJS_s,'');
            lName += '.json';
        }
        
        pEvent.dataTransfer.setData("DownloadURL",
            'application/octet-stream'  + ':' +
            lName                       + ':' + 
            lLink);
    };
    
    var lSetCurrentFile_f = function(pEvent){
        var pElement = pEvent.target;                
        
        var lTag = pElement.tagName;
        if(lTag !== 'LI')
            do{            
                pElement = pElement.parentElement;
                lTag = pElement.tagName;
            }while(lTag !== 'LI');
        
        Util.setCurrentFile(pElement);
    };
        
    for(var i=0; i < a.length ; i++)
    {        
        /* убираем адрес хоста*/
        var link = '/'+a[i].href.replace(document.location.href,'');
        
        /* убираем значения, которые говорят,   *
         * об отсутствии js                     */     
        if(link.indexOf(lNoJS_s) === lFS_s.length){
            link = link.replace(lNoJS_s,'');
        }
        /* ставим загрузку гифа на клик*/
        if(i === lREFRESHICON){
            a[i].onclick = CloudClient._loadDir(link,true);
            
            a[i].parentElement.onclick = a[i].onclick;
        }
            
        /* устанавливаем обработчики на строку на одинарное и   *
         * двойное нажатие на левую кнопку мышки                */
        else{
            var lLi;
            
            try{
                lLi = a[i].parentElement.parentElement;
            }catch(error){console.log(error);}
            
            /* if we in path changing onclick events */
            if (lLi.className === 'path') {
                a[i].onclick  = CloudClient._loadDir(link);
            }
            else {
                lLi.onclick   = CloudClient._setCurrent();
                
                lLi.onmousedown = lSetCurrentFile_f;
                
                a[i].ondragstart = lOnDragStart_f;
                
                /* if right button clicked menu will
                 * loads and shows
                 */
                lLi.oncontextmenu = lOnContextMenu_f;
                
                /* если ссылка на папку, а не файл */
                if(a[i].target !== '_blank'){
                    lLi.ondblclick  = CloudClient._loadDir(link);
                    
                    if(lLi.addEventListener)
                        lLi.addEventListener('touchend',
                            CloudClient._loadDir(link),
                            false);                                        
                }
                
                lLi.id = (a[i].title ? a[i].title : a[i].textContent) +
                    '(' + pPanelID + ')';
            }
        }        
    }
};

/*
 * Функция загружает json-данные о Файловой Системе
 * через ajax-запрос.
 * @path - каталог для чтения
 * @pNeedRefresh - необходимость обновить данные о каталоге
 */
CloudClient._ajaxLoad = function(path, pNeedRefresh)
{                                   
        /* Отображаем красивые пути */
        /* added supporting of russian  language */
        var lPath = decodeURI(path);
        var lFS_s = CloudFunc.FS;
        if(lPath.indexOf(lFS_s) === 0){
            lPath = lPath.replace(lFS_s,'');
            
            if(lPath === '') lPath='/';
        }
        console.log ('reading dir: "'+lPath+'";');
        
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
         var lPanel;
         try{            
            lPanel = Util.getPanel().id;
         }catch(error){console.log("Current panel not found\n"+error);}
         
        if(pNeedRefresh === undefined && lPanel){
            var lJSON = CloudClient.Cache.get(lPath);
            if (lJSON !== null){
                
                /* переводим из текста в JSON */
                if(window && !window.JSON){
                    try{
                        lJSON = eval('('+lJSON+')');
                    }catch(err){
                        console.log(err);
                    }
                }else lJSON = JSON.parse(lJSON);
                
                CloudClient._createFileTable(lPanel,lJSON);
                CloudClient._changeLinks(lPanel);
                
                return;
            }
        }
        
        /* ######################## */
        try{
            Util.ajax({
                url: path,
                error: Util.Images.showError,
                
                success:function(data, textStatus, jqXHR){                                            
                    /* если такой папки (или файла) нет
                     * прячем загрузку и показываем ошибку
                     */                 
                    if(!jqXHR.responseText.indexOf('Error:'))
                        return Util.showError(jqXHR);

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
                    if(lJSON_s.length<50000)
                        CloudClient.Cache.set(lPath,lJSON_s);                        
                }
            });
        }catch(err){console.log(err);}
};

/*
 * Функция строит файловую таблицу
 * @pEleme - родительский элемент
 * @pJSON  - данные о файлах
 */
CloudClient._createFileTable = function(pElem, pJSON)
{    
    var lElem = getById(pElem);
    
    /* getting current element if was refresh */
    var lPath = getByClass('path', lElem);
    var lWasRefresh_b = lPath[0].textContent === pJSON[0].path;
    var lCurrent;    
    if(lWasRefresh_b)
        lCurrent = Util.getCurrentFile();
            
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
        Util.setCurrentFile(lCurrent);
        //lCurrent.parentElement.focus();
    }
};

/* 
 * Функция генерирует JSON из html-таблицы файлов и
 * используеться при первом заходе в корень
 */
CloudClient._getJSONfromFileTable=function()
{
    var lLeft       = getById('left');    
    var lPath       = getByClass('path')[0].textContent;
    var lFileTable  = [{path:lPath,size:'dir'}];
    var lLI         = lLeft.getElementsByTagName('li');
    
    var j=1;/* счётчик реальных файлов */
    var i=1;/* счётчик элементов файлов в DOM */
    /* Если путь отличный от корневного
     * второй элемент li - это ссылка на верхний
     * каталог '..'
     */
    i=2; /* пропускам Path и Header*/
    
    for(;i<lLI.length;i++)
    {
        var lChildren = lLI[i].children;
        
        /* file attributes */
        var lAttr = {};
        /* getting all elements to lAttr object */ 
        for(var l = 0; l < lChildren.length; l++)
            lAttr[lChildren[l].className] = lChildren[l];
        
        /* mini-icon */
        var lIsDir = lAttr['mini-icon directory'] ? true : false;
        
        var lName = lAttr.name;
        lName &&
            (lName = lName.getElementsByTagName('a'));
        
        /* if found link to folder 
         * cheking is it a full name
         * or short
         */
         /* if short we got title 
         * if full - getting textConent
         */
        lName.length &&
            (lName = lName[0]);
            
        lName.title &&
            (lName = lName.title) ||
            (lName = lName.textContent);        
            
        /* если это папка - выводим слово dir вместо размера*/        
        var lSize = lIsDir ? 'dir' : lAttr.size.textContent;
        
        var lMode = lAttr.mode.textContent;
        
        /* переводим права доступа в цыфровой вид
         * для хранения в localStorage
         */
        lMode = CloudFunc.convertPermissionsToNumberic(lMode);
        
        lFileTable[j++]={
            name: lName,
            size: lSize,
            mode: lMode
        };
    }
    return JSON.stringify(lFileTable);
};

return CloudClient;
})();

try{
    window.onload = function(){
        'use strict';        
        
        /* базовая инициализация*/
        CloudCommander.init();
        
        /* привязываем клавиши к функциям */
        CloudCommander.KeyBinding();
        
        /* загружаем Google Analytics */
        CloudCommander.GoogleAnalytics();
    };
}
catch(err){}