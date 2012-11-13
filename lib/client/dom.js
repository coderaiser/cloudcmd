var CloudCommander, $, Util, DOM, CloudFunc;

(function(){
    "use strict";
    
    DOM = {};
    
    /* PRIVATE */
    
    function getCurrentFile(){
        return CloudCommander.CURRENT_FILE;
    }
    
    /* private members */
    var XMLHTTP,
        LoadingImage,
        ErrorImage,
        
        /* Обьект, который содержит
         * функции для отображения
         * картинок
         */
        Images_o               = {
            /* Функция создаёт картинку загрузки*/
            loading : function(){    
                var lE = DOM.getById('loading-image');
                if (!lE)
                    lE = DOM.anyload({
                        name        : 'span',
                        className   : 'icon loading',
                        id          : 'loading-image',
                        not_append  : true
                    });
                
                LoadingImage = lE;
            
                return lE;
            },
        
            /* Функция создаёт картинку ошибки загрузки*/
            error : function(){
                var lE = DOM.getById('error-image');
                if (!lE)
                    lE = DOM.anyload({
                        name        : 'span',
                        className   : 'icon error',
                        id          : 'error-image',
                        not_append  : true
                    });
                
                return lE;
            }
        };
    
    DOM.addClass               = function(pElement, pClass){
        var lRet_b = true;
        
        var lClassList = pElement.classList;
        if(lClassList){
            if( !lClassList.contains(pClass) )
                lClassList.add(pClass);
            else
                lRet_b = false;
        }        
        
        return lRet_b;
    };
    
     /**
     * safe add event listener
     * @param pType
     * @param pListener
     * @param pUseCapture
     */
    DOM.addListener             = function(pType, pListener, pUseCapture, pElement){
        return (pElement || document).addEventListener(
            pType, 
            pListener,
            pUseCapture || false
        );
    };
    
    /**
     * safe add event keydown listener
     * @param pType
     * @param pListener
     * @param pUseCapture
     */
    DOM.addKeyListener          = function(pListener, pUseCapture){
        return DOM.addListener('keydown', pListener, pUseCapture);
    };
    
    /* Load file countent thrue ajax */
    DOM.ajax                    = function(pParams){
        /* if on webkit */
        if(!XMLHTTP)
            XMLHTTP = new XMLHttpRequest();
        
        var lMethod = 'GET';
        if(pParams.method)
            lMethod = pParams.method;
        
        XMLHTTP.open(lMethod, pParams.url, true);
        XMLHTTP.send(null);
                    
        var lSuccess_f = pParams.success;
        if( !Util.isFunction(lSuccess_f) )
            console.log('error in DOM.ajax onSuccess:', pParams);
        
        XMLHTTP.onreadystatechange = function(pEvent){                
            if (XMLHTTP.readyState === 4 /* Complete */){
                var lJqXHR = pEvent.target,
                    lType = XMLHTTP.getResponseHeader('content-type');
                
                if (XMLHTTP.status     === 200 /* OK */){                        
                    var lData = lJqXHR.response;
                    
                    /* If it's json - parse it as json */                        
                    if(lType && Util.isContainStr(lType, 'application/json') ){
                        var lResult = Util.tryCatch(function(){
                            lData = JSON.parse(lJqXHR.response);
                        });
                        
                        if( Util.log(lResult) )
                            lData = lJqXHR.response;
                    }
                    
                    lSuccess_f(lData, lJqXHR.statusText, lJqXHR);
                }
                else/* file not found or connection lost */{
                    /* if html given or something like it
                     * getBack just status of result
                     */
                    if(lType &&
                        lType.indexOf('text/plain') !== 0){
                            lJqXHR.responseText = lJqXHR.statusText;
                    }
                        Util.exec(pParams.error, lJqXHR);
                }
            }
        };
    };
        
    /*
     * Function gets id by src
     * from http://domain.com/1.js to
     * 1_js
     */
    DOM.getIdBySrc             = function(pSrc){
        var lID = pSrc.replace(pSrc.substr(pSrc,
                    pSrc.lastIndexOf('/')+1),
                    '');
        
        /* убираем точки */
        while(lID.indexOf('.') > 0)
            lID = lID.replace('.','_');
        
        return lID;
    },
    
    
    DOM.anyLoadOnLoad          = function(pParams_a, pFunc){
        if( Util.isArray(pParams_a) ) {
            var lParam = pParams_a.pop();
            
            if(Util.isString(lParam) )
                lParam = { src : lParam };
            
            
            if(lParam && !lParam.func){
                lParam.func = function(){
                    DOM.anyLoadOnLoad(pParams_a, pFunc);
                };
                
                DOM.anyload(lParam);
            
            }else
                Util.exec(pFunc);
        }
    };
    
    /**
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
     * @param pParams_o = {name: '', src: ' ',func: '', style: '', id: '', parent: '',
        async: false, inner: 'id{color:red, }, class:'', not_append: false}
     */
    DOM.anyload                = function(pParams_o){
        
        if( !pParams_o ) return;
        
        /* if a couple of params was
         * processing every of params
         * and quit
         */
        if( Util.isArray(pParams_o) ){
            var lElements_a = [];
            for(var i = 0, n = pParams_o.length; i < n ; i++)
                lElements_a[i] = DOM.anyload(pParams_o[i]);
            
            return lElements_a;
        }
        
        var lName       = pParams_o.name,
            lID         = pParams_o.id,
            lClass      = pParams_o.className,
            lSrc        = pParams_o.src,
            lFunc       = pParams_o.func,
            lOnError,
            lAsync      = pParams_o.async,
            lParent     = pParams_o.parent,
            lInner      = pParams_o.inner,
            lNotAppend  = pParams_o.not_append;
        
        if ( Util.isObject(lFunc) ){
            lOnError = lFunc.onerror;
            lFunc  = lFunc.onload;
        }
        /* убираем путь к файлу, оставляя только название файла */
        if(!lID && lSrc)
            lID = DOM.getIdBySrc(lSrc);
                
        var element = DOM.getById(lID);
        
        /* если скрипт еще не загружен */
        if(!element){
            if(!lName && lSrc){
                
                var lDot = lSrc.lastIndexOf('.'),
                    lExt =  lSrc.substr(lDot);
                switch(lExt){
                    case '.js':
                        lName = 'script';
                        break;
                    case '.css':
                        lName = 'link';
                        lParent = document.head;
                        break;
                    default:
                        return {code: -1, text: 'name can not be empty'};
                }
            }
            element         = document.createElement(lName);
            
            if(lID)
                element.id  = lID;
            
            if(lClass)
                element.className = lClass;
            
            /* if working with external css
             * using href in any other case
             * using src
             */
            if(lName === 'link'){
                  element.href = lSrc;
                  element.rel = 'stylesheet';
            }else
                element.src  = lSrc;
            
            /*
             * if passed arguments function
             * then it's onload by default
             *
             * if object - then onload and onerror
             */
            
            if( Util.isFunction(lFunc) )
                element.onload = lFunc;
            
            /* if element (js/css) will not loaded
             * it would be removed from DOM tree
             * and error image would be shown
             */
            element.onerror = (function(){
                    (pParams_o.parent || document.body)
                        .removeChild(element);
                                        
                    DOM.Images.showError({
                        responseText: 'file ' +
                        lSrc                  +
                        ' could not be loaded',
                        status : 404
                    });
                    
                    Util.exec(lOnError);
            });
            
            if(pParams_o.style){
                element.style.cssText = pParams_o.style;
            }
            
            if(lAsync || lAsync === undefined)
                element.async = true;
            
            if(!lNotAppend)
                (lParent || document.body).appendChild(element);
            
            if(lInner){
                element.innerHTML = lInner;
            }
        }
        /* если js-файл уже загружен 
         * запускаем функцию onload
         */
        else
            Util.exec(lFunc);
        
        return element;
    },

    /* Функция загружает js-файл */
    DOM.jsload                 = function(pSrc, pFunc){
        if(pSrc instanceof Array){
            for(var i=0; i < pSrc.length; i++)
                pSrc[i].name = 'script';
            
            return DOM.anyload(pSrc);
        }
        
        return DOM.anyload({
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
    
    DOM.cssSet                 = function(pParams_o){
        pParams_o.name      = 'style';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return DOM.anyload(pParams_o);                
    },
    
    /* Function loads external css files 
     * @pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */
    DOM.cssLoad                = function(pParams_o){
         if( Util.isArray(pParams_o) ){
            for(var i = 0, n = pParams_o.length; i < n; i++){
                pParams_o[i].name = 'link';
                pParams_o[i].parent   = pParams_o.parent || document.head;                
            }
            
            return DOM.anyload(pParams_o);
        } 
        
        else if( Util.isString(pParams_o) )
            pParams_o = { src: pParams_o };
                
        pParams_o.name      = 'link';
        pParams_o.parent    = pParams_o.parent || document.head;

        return DOM.anyload(pParams_o);
    };
    
    DOM.jqueryLoad             = function(pCallBack){
        /* загружаем jquery: */
        DOM.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js',{
            onload: Util.retExec(pCallBack),
            
            onerror: function(){
                DOM.jsload('lib/client/jquery.js');
                
                /*
                 * if could not load jquery from google server
                 * maybe we offline, load font from local
                 * directory
                 */
                DOM.cssSet({id:'local-droids-font',
                    element : document.head,
                    inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                                'font-style: normal;font-weight: normal;'               +
                                'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                                ' url("font/DroidSansMono.woff") format("woff");}'
                });                   
            }
        });
    };
    
    DOM.socketLoad             = function(pCallBack){
        DOM.jsload('lib/client/socket.js', pCallBack);
    };
    
    /* DOM */
    
    /**
     * Function search element by tag
     * @pTag - className
     * @pElement - element
     */
    DOM.getByTag               = function(pTag, pElement){
        return (pElement || document).getElementsByTagName(pTag);
    };
    
    /**
     * Function search element by id
     * @Id - className
     * @pElement - element
     */
    DOM.getById                = function(pId, pElement){
        return (pElement || document).getElementById(pId);
    };
    
    /**
     * Function search element by class name
     * @pClass - className
     * @pElement - element
     */
    DOM.getByClass             = function(pClass, pElement){
        return (pElement || document).getElementsByClassName(pClass);            
    };
    
    
    DOM.Images                 = {
        /* 
         * Function shows loading spinner
         * @pElem - top element of screen
         * pPosition = {top: true};
         */   
        showLoad        : function(pPosition){
            var lRet_b = true;
            
            LoadingImage   = Images_o.loading();
            ErrorImage     = Images_o.error();
            
            DOM.hide(ErrorImage);
            
            var lCurrent;
            if(pPosition){
                if(pPosition.top){
                    lCurrent    = DOM.getRefreshButton();
                    if(lCurrent)
                        lCurrent = lCurrent.parentElement;
                    else
                        lRet_b  = false;
                }
            }
            else{
                lCurrent    = DOM.getCurrentFile();
                lCurrent    = lCurrent.firstChild.nextSibling;
            }
                                 
            /* show loading icon
             * if it not showed  
             * and if error was not
             * heppen
             */
            if(lRet_b){
                var lParent = LoadingImage.parentElement;
                if(!lParent ||
                    (lParent && lParent !== lCurrent))
                        lCurrent.appendChild(LoadingImage);
                
                DOM.show(LoadingImage); /* показываем загрузку*/
            }
            
            return lRet_b;
        },
        
        hideLoad        : function(){
            LoadingImage = Images_o.loading();
            DOM.hide(LoadingImage);
        },
        
        showError       : function(jqXHR, textStatus, errorThrown){
            LoadingImage = Images_o.loading();
            
            ErrorImage = Images_o.error();
                        
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
            
            DOM.show(ErrorImage);
            ErrorImage.title = lText;
            
            var lParent = LoadingImage.parentElement;
            if(lParent)
                lParent.appendChild(ErrorImage);
            
            DOM.hide(LoadingImage);
            
            console.log(lText);
        }
    };
        
    DOM.getCurrentFile         = function(){
        var lCurrent = DOM.getByClass(getCurrentFile())[0];
        if(!lCurrent)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error: can not find '  +
                        'CurrentFile '         +
                        'in getCurrentFile'
            });
        
        return lCurrent;
    };
    
    DOM.getRefreshButton       = function(){
        var lPanel      = DOM.getPanel(),
            lRefresh    = DOM.getByClass(CloudFunc.REFRESHICON, lPanel);
                        
        if (lRefresh.length)                
            lRefresh = lRefresh[0];
        else {
            DOM.addCloudStatus({
                code : -3,
                msg  : 'Error Refresh icon not found'
                });
            lRefresh = false;
        }
        
        return lRefresh;
    };
    
    DOM.setCurrentFile         = function(pCurrentFile){
        var lRet_b = true;
        
        if(!pCurrentFile){
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  +
                        'setCurrentFile'        +
                        'could not be none'
            });
            
            lRet_b = false;
        }
        var lCurrentFileWas = DOM.getCurrentFile();
                        
        if (pCurrentFile.className === 'path')
            pCurrentFile = pCurrentFile.nextSibling;
        
        if (pCurrentFile.className === 'fm_header')
            pCurrentFile = pCurrentFile.nextSibling;
        
        if(lCurrentFileWas)
            lUnSetCurrentFile(lCurrentFileWas);

        DOM.addClass(pCurrentFile, getCurrentFile());
        
        /* scrolling to current file */
        DOM.scrollIntoViewIfNeeded(pCurrentFile);
        
        return  lRet_b;
    };
    
    var lUnSetCurrentFile       = function(pCurrentFile){
        if(!pCurrentFile)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  +
                        'unSetCurrentFile'        +
                        'could not be none'
            });
        
        var lRet_b = DOM.isCurrentFile(pCurrentFile);

        if(lRet_b)            
            DOM.removeClass(pCurrentFile, getCurrentFile());                    
        
        return lRet_b;
    };
    
    DOM.isCurrentFile          = function(pCurrentFile){
        if(!pCurrentFile)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'  + 
                        'isCurrentFile'         +
                        'could not be none'
            });
        
        var lCurrentFileClass   = pCurrentFile.className,
            lIsCurrent          = lCurrentFileClass.indexOf(getCurrentFile()) >= 0;
            
        return lIsCurrent;
    };
    
    
    DOM.getCurrentLink         = function(pCurrentFile){                
        var lLink = DOM.getByTag('a',
            pCurrentFile || DOM.getCurrentFile()),
            
            lRet = lLink.length > 0 ? lLink[0] : -1;
        
        if(!lRet)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error current element do not contain links'
            });
        
        return lRet; 
    };
    
    DOM.getCurrentName         = function(pCurrentFile){
        var lLink    = DOM.getCurrentLink(
            pCurrentFile || DOM.getCurrentFile());
            
        if(!lLink)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error current element do not contain links'
            });
        else lLink = lLink.textContent;
        
        return lLink; 
    };
    
    /** function getting FM
     * @param pPanel_o = {active: true}
     */
    DOM.getFM               = function(){
        return DOM.getPanel().parentElement;
    };
    
    /** function getting panel active, or passive
     * @param pPanel_o = {active: true}
     */
    DOM.getPanel               = function(pActive){        
        var lPanel = DOM.getCurrentFile().parentElement;
                            
        /* if {active : false} getting passive panel */
        if(pActive && !pActive.active){
            var lId = lPanel.id === 'left' ? 'right' : 'left';
            lPanel = DOM.getById(lId);
        }
        
        /* if two panels showed
         * then always work with passive
         * panel
         */
        if(window.innerWidth < CloudCommander.MIN_ONE_PANEL_WIDTH)
            lPanel = DOM.getById('left');
            
        
        if(!lPanel)
            console.log('Error can not find Active Panel');
        
        return lPanel;
    };
    
    DOM.show                   = function(pElement){
        DOM.removeClass(pElement, 'hidden');
    };
    
    DOM.showPanel              = function(pActive){
        var lRet = true,
            lPanel = DOM.getPanel(pActive);
                        
        if(lPanel)
            DOM.show(lPanel);
        else
            lRet = false;
        
        return lRet;
    };
    
    DOM.hidePanel              = function(pActive){
        var lRet = false,
            lPanel = DOM.getPanel(pActive);
        
        if(lPanel)
            lRet = DOM.hide(lPanel);
        
        return lRet;
    };
    
    DOM.hide                   = function(pElement){
        return DOM.addClass(pElement, 'hidden');
    };
    
    DOM.removeClass            = function(pElement, pClass){
        var lRet_b = true,
            lClassList = pElement.classList;
        
        if(pElement && lClassList)
           lClassList.remove(pClass);
        
        else
            lRet_b = false;
        
        return lRet_b;
    };
    
    DOM.removeCurrent          = function(pCurrent){
        var lParent = pCurrent.parentElement;
        
        if(!pCurrent)
            pCurrent = DOM.getCurrentFile();
        var lName = DOM.getCurrentName(pCurrent);
        
        if(pCurrent && lParent){
            if(lName !== '..'){
                var lNext       = pCurrent.nextSibling;
                var lPrevious   = pCurrent.previousSibling;
                if(lNext)
                    DOM.setCurrentFile(lNext);
                else if(lPrevious)
                    DOM.setCurrentFile(lPrevious);
                            
                lParent.removeChild(pCurrent);
            }
            else 
                DOM.addCloudStatus({
                    code : -1,
                    msg  : 'Could not remove parrent dir'
                });
        }
        else
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Current file (or parent of current) could not be empty'
            });
            
        return pCurrent;
    };
    
    DOM.scrollIntoViewIfNeeded = function(pElement){
        var lRet = true;
        
        if(pElement && pElement.scrollIntoViewIfNeeded)
            pElement.scrollIntoViewIfNeeded();
        else
            lRet = false;
        
        return lRet;
    };
    
    
    /** 
     * function gets time
     */
    DOM.getTime = function(){
        var date        = new Date(),
            hours       = date.getHours(),
            minutes     = date.getMinutes(),
            seconds     = date.getSeconds();
            
        minutes         = minutes < 10 ? '0' + minutes : minutes;
        seconds         = seconds < 10 ? '0' + seconds : seconds;
        
        return hours + ":" + minutes + ":" + seconds;
    };
    
    DOM.CloudStatus = [];
    
    DOM.addCloudStatus = function(pStatus){
        DOM.CloudStatus[DOM.CloudStatus.length] = pStatus;
    };
})();