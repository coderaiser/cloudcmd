var CloudCommander, Util,
    DOM = {},
    CloudFunc;
    
(function(Util, DOM){
    'use strict';
    
    /* PRIVATE */
    
    /* private members */
    var /* название css-класа текущего файла*/
        CURRENT_FILE    = 'current-file',
        Listeners       = [],
        XMLHTTP,
        Title,
        
        /* Обьект, который содержит
         * функции для отображения
         * картинок
         */
        Images = function (){
            var getImage = function(pName){
                var lId = pName + '-image',
                    lE = DOM.getById(lId);
                if (!lE)
                    lE = DOM.anyload({
                        name        : 'span',
                        className   : 'icon ' + pName,
                        id          : lId,
                        not_append  : true
                    });
                
                return lE;
            };
            /* Функция создаёт картинку загрузки*/
            this.loading = function(){
                return getImage('loading');
            };
            
            /* Функция создаёт картинку ошибки загрузки*/
            this.error = function(){
                return getImage('error');
            };
        };
    
    Images = new Images();
    
    function removeListenerFromList(pElement){
        var lRet;
        
        for(var i = 0, n = Listeners.length; i < n; i++){
            if(Listeners[i].element === pElement){
                Listeners[i] = null;
                break;
            }
        }
        
        return lRet;
    }
    
    /**
     * private function thet unset currentfile
     */
    function unSetCurrentFile(pCurrentFile){
        var lRet_b = DOM.isCurrentFile(pCurrentFile);
        
        if(!pCurrentFile)
            DOM.addCloudStatus({
                code : -1,
                msg  : 'Error pCurrentFile in'      +
                        'unSetCurrentFile'          +
                        'could not be none'
            });
        
        if(lRet_b)
            DOM.removeClass(pCurrentFile, CURRENT_FILE);
        
        return lRet_b;
    }
    
    /**
     * add class to current element
     * @param pElement
     * @param pClass
     */
    DOM.addClass                = function(pElement, pClass){
        var lRet;
        
        if(pElement){
            var lClassList = pElement.classList;
            
            if(lClassList){
                if( !lClassList.contains(pClass) )
                    lClassList.add(pClass);
                    lRet = true;
            }
        }
        
        return lRet;
    };
    
    /**
     * safe add event listener
     * @param pType
     * @param pListener
     * @param pUseCapture
     * @param pElement {document by default}
     */
    DOM.addListener             = function(pType, pListener, pElement, pUseCapture){
        var lRet        = this,
            lElement    = (pElement || window);
        
        
        lElement.addEventListener(
            pType,
            pListener,
            pUseCapture || false
        );
        
        Listeners.push({
            element : lElement,
            callback: pListener
        });
        
        return lRet;
    };
    
    /**
     * safe add event listener
     * @param pType
     * @param pListener
     * @param pUseCapture
     * @param pElement {document by default}
     */
    DOM.addOneTimeListener       = function(pType, pListener, pElement, pUseCapture){
        var lRet = this;
        
        DOM.addListener(pType,
            function oneTime(pEvent){
                DOM.removeListener(pType, oneTime, pElement, pUseCapture);
                pListener(pEvent);
            },
            pUseCapture, pElement);
        
        return lRet;
    };
    
    /**
     * safe remove event listener
     * @param pType
     * @param pListener
     * @param pUseCapture
     * @param pElement {document by default}
     */
    DOM.removeListener             = function(pType, pListener, pElement, pUseCapture){
        var lRet = this;
        
        (pElement || window).removeEventListener(
            pType,
            pListener,
            pUseCapture || false
        );
        
        return lRet;
    };
    
    
    /**
     * safe add event keydown listener
     * @param pListener
     * @param pUseCapture
     */
    DOM.addKeyListener          = function(pListener, pElement, pUseCapture){
        return DOM.addListener('keydown', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * @param pListener
     * @param pUseCapture
     */
    DOM.addClickListener        = function(pListener, pElement, pUseCapture){
        return DOM.addListener('click', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * @param pListener
     * @param pUseCapture
     */
    DOM.addErrorListener        = function(pListener, pElement, pUseCapture){
        return DOM.addListener('error', pListener, pElement, pUseCapture);
    };
    
    /**
     * getListener for element
     * 
     * @param pElement
     */
    DOM.getListener             = function(pElement){
        var lRet;
        
        for(var i = 0, n = Listeners.length; i < n; i++){
            if(Listeners[i].element === pElement){
                lRet = Listeners[i].callback;
                break;
            }
        }
        
        return lRet;
    };
    
    /**
     * load file countent thrue ajax
     */
    DOM.ajax                    = function(pParams){
        var lType       = pParams.type || 'GET',
            lData       = pParams.data,
            lSuccess_f  = pParams.success;
        
        if(!XMLHTTP)
            XMLHTTP     = new XMLHttpRequest();
        
        XMLHTTP.open(lType, pParams.url, true);
        XMLHTTP.send(lData);
        
        if( !Util.isFunction(lSuccess_f) ){
            Util.log('error in DOM.ajax onSuccess:', pParams);
            Util.log(pParams);
        }
        
        XMLHTTP.onreadystatechange = function(pEvent){
            if (XMLHTTP.readyState === 4 /* Complete */){
                var lJqXHR = pEvent.target,
                    lType = XMLHTTP.getResponseHeader('content-type');
                
                if (XMLHTTP.status     === 200 /* OK */){
                    var lData = lJqXHR.response;
                    
                    /* If it's json - parse it as json */
                    if(lType && Util.isContainStr(lType, 'application/json') ){
                        var lResult = Util.tryCatch(function(){
                            lData = Util.parseJSON(lJqXHR.response);
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
    
    /**
     * Обьект для работы с кэшем
     * в него будут включены функции для
     * работы с LocalStorage, webdb,
     * indexed db etc.
     */
    DOM.Cache                   = function(){
        /* приватный переключатель возможности работы с кэшем */
        var CacheAllowed;
        
        /* функция проверяет возможно ли работать с кэшем каким-либо образом */
        this.isAllowed   = function(){
            return  ( CacheAllowed = Util.isObject( window.localStorage ) );
        };
        
        
        /**
         * allow cache usage
         */
        this.setAllowed = function(){
            var lRet = this;
            CacheAllowed = true;
            
            return lRet;
        };
        
        /**
         * dissalow cache usage
         */
        this.UnSetAllowed = function(){
            var lRet = this;
            CacheAllowed = false;
            
            return lRet;
        };
        
        /** remove element */
        this.remove      = function(pItem){
            var lRet = this;
            
            if(CacheAllowed)
                localStorage.removeItem(pItem);
                
            return lRet;
        };
        
        /** если доступен localStorage и
         * в нём есть нужная нам директория -
         * записываем данные в него
         */
        this.set         = function(pName, pData){
            var lRet = this;
            
            if(CacheAllowed && pName && pData)
                localStorage.setItem(pName,pData);
            
            return lRet;
        },
        
        /** Если доступен Cache принимаем из него данные*/
        this.get        = function(pName){
            var lRet = this;
            
            if(CacheAllowed)
                lRet = localStorage.getItem(pName);
                
            return lRet;
        },
        
        /* get all cache from local storage */
        this.getAll     = function(){
            var lRet = null;
            
            if(CacheAllowed)
                lRet = localStorage;
            
            return lRet;
        };
        
        /** функция чистит весь кэш для всех каталогов*/
        this.clear       = function(){
            var lRet = this;
            
            if(CacheAllowed)
                localStorage.clear();
            
            return lRet;
        };
    };
    
    DOM.Cache = new DOM.Cache();
    
    /**
     * delete currentfile, prompt before it
     *
     * @pCurrentFile
     */
    DOM.promptRemoveCurrent = function(pCurrentFile){
        var lRet,
            lCurrent,
            lName,
            lMsg = 'Are you sure thet you wont delete ';
        
        /* dom element passed and it is not event */
        if(pCurrentFile && !pCurrentFile.type)
            lCurrent = pCurrentFile;
            
        lName = DOM.getCurrentName(lCurrent);
        
        lRet  = confirm(lMsg + lName + '?');
        
        if(lRet)
            DOM.removeCurrent(lCurrent);
        
        return lRet;
    };
    
    /**
     * Function gets id by src
     * @param pSrc
     * 
     * Example: http://domain.com/1.js -> 1_js
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
    
    /**
     * create elements and load them to DOM-tree
     * one-by-one
     * 
     * @param pParams_a
     * @param pFunc - onload function
     */
    DOM.anyLoadOnLoad          = function(pParams_a, pFunc){
        var lRet = this;
        
        if( Util.isArray(pParams_a) ) {
            var lParam  = pParams_a.pop(),
                lFunc   = function(){
                    DOM.anyLoadOnLoad(pParams_a, pFunc);
                };
            
            if( Util.isString(lParam) )
                lParam = { src : lParam };
            else if( Util.isArray(lParam) ){
                
                DOM.anyLoadInParallel(lParam, lFunc);
            }
            
            if(lParam && !lParam.func){
                lParam.func = lFunc;
                
                DOM.anyload(lParam);
            
            }else
                Util.exec(pFunc);
        }
        
        return lRet;
    };
    
    /**
     * improve callback of funcs so
     * we pop number of function and
     * if it's last we call pCallBack
     * 
     * @param pParams_a
     * @param pFunc - onload function
     */
    DOM.anyLoadInParallel        = function(pParams_a, pFunc){
        var lRet = this,
            done = [],
            
            doneFunc = function (pCallBack){
                Util.exec(pCallBack);
                
                if( !done.pop() )
                    Util.exec(pFunc);
            };
        
        if( !Util.isArray(pParams_a) ){
            pParams_a = [pParams_a];
        }
        
        for(var i = 0, n = pParams_a.length; i < n; i++){
            var lParam = pParams_a.pop();
            
            if(lParam){
                done.push(i);
                
                if(Util.isString(lParam) )
                    lParam = { src : lParam };
                
                var lFunc = lParam.func;
                lParam.func = Util.retExec(doneFunc, lFunc);
                
                DOM.anyload(lParam);
            }
        }
        
        return lRet;
    };
    
    /**
     * Функция создаёт элемент и загружает файл с src.
     * 
     * @param pParams_o = {
     * name, - название тэга
     * src', - путь к файлу
     * func, - обьект, содержаий одну из функций 
     *          или сразу две onload и onerror
     *          {onload: function(){}, onerror: function();}
     * style,
     * id,
     * element,
     * async, - true by default
     * inner: 'id{color:red, },
     * class, 
     * not_append - false by default
     * }
     */
    DOM.anyload                 = function(pParams_o){
        
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
            lParent     = pParams_o.parent || document.body,
            lInner      = pParams_o.inner,
            lStyle      = pParams_o.style,
            lNotAppend  = pParams_o.not_append;
        
        if ( Util.isObject(lFunc) ){
            lOnError = lFunc.onerror;
            lFunc  = lFunc.onload;
        }
        /* убираем путь к файлу, оставляя только название файла */
        if(!lID && lSrc)
            lID = DOM.getIdBySrc(lSrc);
                
        var lElement = DOM.getById(lID);
        
        /* если скрипт еще не загружен */
        if(!lElement){
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
            lElement         = document.createElement(lName);
            
            if(lID)
                lElement.id  = lID;
            
            if(lClass)
                lElement.className = lClass;
            
            /* if working with external css
             * using href in any other case
             * using src
             */
            if(lName === 'link'){
                  lElement.href = lSrc;
                  lElement.rel = 'stylesheet';
            }else
                lElement.src  = lSrc;
            
            /*
             * if passed arguments function
             * then it's onload by default
             *
             * if object - then onload and onerror
             */
            
            var lLoad     = function(pEvent){
                    DOM.removeListener('load', lLoad, false, lElement);
                    DOM.removeListener('error', lError, false, lElement);
                    
                    Util.exec(lFunc, pEvent);
                },
                
                lError    = function(){
                    lParent.removeChild(lElement);
                                        
                    DOM.Images.showError({
                        responseText: 'file ' +
                        lSrc                  +
                        ' could not be loaded',
                        status : 404
                    });
                    
                    Util.exec(lOnError);
                };
            
            DOM.addListener('load', lLoad, lElement);
            DOM.addErrorListener(lError,lElement);
            
            if(lStyle)
                lElement.style.cssText = lStyle;
            
            if(lAsync || lAsync === undefined)
                lElement.async = true;
            
            if(!lNotAppend)
                lParent.appendChild(lElement);
            
            if(lInner)
                lElement.innerHTML = lInner;
        }
        /* если js-файл уже загружен 
         * запускаем функцию onload
         */
        else
            Util.exec(lFunc);
        
        return lElement;
    },

    /** 
     * Функция загружает js-файл
     * 
     * @param pSrc
     * @param pFunc
     */
    DOM.jsload                  = function(pSrc, pFunc){
        if( Util.isArray(pSrc) ){
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
    
    /**
     * returns jsload functions
     */    
    DOM.retJSLoad               = function(pSrc, pFunc){
        var lRet = function(){
            return DOM.jsload(pSrc, pFunc);
        };
        
        return lRet;
    },
    
    
    /**
     * Функция создаёт елемент style и записывает туда стили 
     * @param pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */    
    DOM.cssSet                  = function(pParams_o){
        pParams_o.name      = 'style';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return DOM.anyload(pParams_o);
    },
    
    /**
     * Function loads external css files 
     * @pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */
    DOM.cssLoad                 = function(pParams_o){
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
    
    /**
     * load jquery from google cdn or local copy
     * @param pCallBack
     */
    DOM.jqueryLoad              = function(pCallBack){
        /* загружаем jquery: */
        DOM.jsload('//code.jquery.com/jquery-1.9.0.min.js',{
            onload: Util.retExec(pCallBack),
            
            onerror: function(){
                DOM.jsload('lib/client/jquery.js');
                
                /*
                 * if could not load jquery from google server
                 * maybe we offline, load font from local
                 * directory
                 */
                DOM.cssSet({
                    id      :'local-droids-font',
                    element : document.head,
                    inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                                'font-style: normal;font-weight: normal;'               +
                                'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                                ' url("font/DroidSansMono.woff") format("woff");}'
                });                   
            }
        });
    };
    
    /**
     * load socket.io
     * @param pCallBack
     */    
    DOM.socketLoad              = function(pCallBack){
        DOM.jsload('/lib/client/socket.js', Util.retExec(pCallBack) );
    };
    
    /* DOM */
    
    /**
     * Function search element by tag
     * @param pTag - className
     * @param pElement - element
     */
    DOM.getByTag                = function(pTag, pElement){
        return (pElement || document).getElementsByTagName(pTag);
    };
    
    /**
     * Function search element by id
     * @param Id - className
     * @param pElement - element
     */
    DOM.getById                = function(pId, pElement){
        return (pElement || document).getElementById(pId);
    };
    
    /**
     * Function search element by class name
     * @param pClass - className
     * @param pElement - element
     */
    DOM.getByClass              = function(pClass, pElement){
        return (pElement || document).getElementsByClassName(pClass);
    };
    
    
    DOM.Images                  = {
        /** 
         * Function shows loading spinner
         * pPosition = {top: true};
         */   
        showLoad        : function(pPosition){
            var lRet_b,
                lLoadingImage   = Images.loading(),
                lErrorImage     = Images.error();
            
            DOM.hide(lErrorImage);
            
            var lCurrent;
            if(pPosition && pPosition.top)
                lCurrent    = DOM.getRefreshButton().parentElement;
            else
                lCurrent    = DOM.getCurrentFile().firstChild.nextSibling;
            
            /* show loading icon if it not showed */
            
            var lParent = lLoadingImage.parentElement;
            if(!lParent || (lParent && lParent !== lCurrent))
                lCurrent.appendChild(lLoadingImage);
            
            lRet_b = DOM.show(lLoadingImage); /* показываем загрузку*/
            
            return lRet_b;
        },
        
        /**
         * hide load image
         */
        hideLoad        : function(){
            
            DOM.hide( Images.loading() );
        },
        
        /**
         * show error image (usualy after error on ajax request)
         */
        showError       : function(jqXHR, textStatus, errorThrown){
            var lLoadingImage   = Images.loading(),
                lErrorImage     = Images.error(),
                lResponce       = jqXHR.responseText,
                lStatusText     = jqXHR.statusText,
                lStatus         = jqXHR.status,
                lText           = (lStatus === 404 ? lResponce : lStatusText);
                        
            /* если файла не существует*/
            if( Util.isContainStr(lText, 'Error: ENOENT, ') )
                lText = lText.replace('Error: ENOENT, n','N');
            
            /* если не хватает прав для чтения файла*/
            else if( Util.isContainStr(lText, 'Error: EACCES,') )
                lText = lText.replace('Error: EACCES, p','P');
            
            
            DOM.show(lErrorImage);
            lErrorImage.title = lText;
            
            var lParent = lLoadingImage.parentElement;
            if(lParent)
                lParent.appendChild(lErrorImage);
            
            DOM.hide(lLoadingImage);
            
            Util.log(lText);
        }
    };
    
    /**
     * get current direcotory path
     */
    DOM.getCurrentDir          = function(){
        var lRet,
            lSubstr,
            lPanel  = DOM.getPanel(),
            /* получаем имя каталога в котором находимся */
            lHref   = DOM.getByClass('path', lPanel);
        
        lHref       = lHref[0].textContent;
        
        lHref       = CloudFunc.removeLastSlash(lHref);
        lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
        lRet        = Util.removeStr(lHref, lSubstr + '/');
        
        return lRet;
    };
    
    /**
     * unified way to get current file
     *
     * @pCurrentFile
     */
    DOM.getCurrentFile          = function(){
        var lRet = DOM.getByClass(CURRENT_FILE )[0];
        
        return lRet;
    };
    
    
    DOM.getCurrentSize          = function(pCurrentFile){
        var lRet,
            lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lSize       = DOM.getByClass('size', lCurrent);
            lRet        = lSize[0].textContent;
        
        return lRet;
    };
    
     /**
     * unified way to get current file content
     *
     * @pCallBack - callback function or data struct {sucess, error}
     * @pCurrentFile
     */
    DOM.getCurrentFileContent       = function(pParams, pCurrentFile){
        var lRet,
            lParams     = pParams ? pParams : {},
            lPath       = DOM.getCurrentPath(pCurrentFile),
            lErrorWas   = pParams.error,
            lError      = function(jqXHR){
                Util.exec(lErrorWas);
                DOM.Images.showError(jqXHR);
            };
        if( Util.isFunction(lParams) )
            lParams.success = Util.retExec(pParams);
        
        lParams.error = lError;
        
        if(!lParams.url)
            lParams.url = lPath;
        
        lRet    = DOM.ajax(lParams);
        
        return lRet;
    };
     
     /**
     * unified way to get current file content
     *
     * @pCallBack - function({data, name}){}
     * @pCurrentFile
     */
     DOM.getCurrentData             = function(pCallBack, pCurrentFile){
        var lParams,
            lFunc = function(pData){
                var lName = DOM.getCurrentName(pCurrentFile);
                if( Util.isObject(pData) ){
                    pData = Util.stringifyJSON(pData);
                    
                    var lExt = '.json';
                    if( !Util.checkExtension(lName, lExt) )
                        lName += lExt;
                }
                
                Util.exec(pCallBack, {
                    data: pData,
                    name: lName
                });
            };
        
        if( !Util.isObject(pCallBack) )
            lParams = lFunc;
        else
            lParams = {
                success : lFunc,
                error   : pCallBack.error
            };
            
        
        return DOM.getCurrentFileContent(lParams, pCurrentFile);
    };
    
    /**
     * unified way to get RefreshButton
     */
    DOM.getRefreshButton        = function(){
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
    
    
    /**
     * unified way to set current file
     */
    DOM.setCurrentFile          = function(pCurrentFile){
        var lRet,
            lCurrentFileWas = DOM.getCurrentFile();
        
        if(pCurrentFile){
            if (pCurrentFile.className === 'path')
                pCurrentFile = pCurrentFile.nextSibling;
            
            if (pCurrentFile.className === 'fm-header')
                pCurrentFile = pCurrentFile.nextSibling;
            
            if(lCurrentFileWas)
                unSetCurrentFile(lCurrentFileWas);
            
            DOM.addClass(pCurrentFile, CURRENT_FILE);
            
            /* scrolling to current file */
            DOM.scrollIntoViewIfNeeded(pCurrentFile);
            
            lRet = true;
        }
        return  lRet;
    };
        
    /**
     * setting history wrapper
     */
    DOM.setHistory              = function(pData, pTitle, pUrl){
        var lRet = true;
        
        if(window.history)
            history.pushState(pData, pTitle, pUrl);
        else
            lRet = false;
        
        return lRet;
    };
    
    /**
     * set onclick handler on buttons f1-f10
     * @param pKey - 'f1'-'f10'
     */
    DOM.setButtonKey            = function(pKey, pFunc){
        return CloudCommander.KeysPanel[pKey].onclick = pFunc;
    };
    
    /**
     * set title with pName
     * create title element 
     * if it  absent
     * @param pName
     */    
    
    DOM.setTitle                = function(pName){
        if(!Title)
            Title =     DOM.getByTag('title')[0] ||
                        DOM.anyload({
                            name:'title',
                            parentElement: document.head,
                            innerHTML: pName
                        });
        if(Title)
            Title.textContent = pName;
        
        return Title;
    };
    
    /**
     * current file check
     * 
     * @param pCurrentFile
     */
    DOM.isCurrentFile           = function(pCurrentFile){
        var lCurrentFileClass   = pCurrentFile.className,
            lIsCurrent          = lCurrentFileClass.indexOf(CURRENT_FILE) >= 0;
        
        return lIsCurrent;
    };
    
    
   /**
     * get link from current (or param) file
     * 
     * @param pCurrentFile - current file by default
     */
    DOM.getCurrentLink          = function(pCurrentFile){
        var lLink = DOM.getByTag( 'a', pCurrentFile || DOM.getCurrentFile() ),
            
            lRet = lLink.length > 0 ? lLink[0] : -1;
        
        return lRet;
    };
    
       /**
     * get link from current (or param) file
     * 
     * @param pCurrentFile - current file by default
     */
    DOM.getCurrentPath          = function(pCurrentFile){
        var lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lPath       = DOM.getCurrentLink( lCurrent ).href;
            /* убираем адрес хоста*/
            lPath = Util.removeStr(lPath, CloudCommander.HOST);
            lPath = Util.removeStr(lPath, CloudFunc.NOJS);
        
        return lPath; 
    };
    
    /**
     * get name from current (or param) file
     * 
     * @param pCurrentFile
     */
    DOM.getCurrentName          = function(pCurrentFile){
        var lCurrent = pCurrentFile || DOM.getCurrentFile(),
            lLink    = DOM.getCurrentLink( lCurrent );
            
        if(lLink)
           lLink = lLink.textContent;
        
        return lLink; 
    };
    
    /** function getting FM
     * @param pPanel_o = {active: true}
     */
    DOM.getFM                   = function(){
        return DOM.getPanel().parentElement;
    };
    
    /** function getting panel active, or passive
     * @param pPanel_o = {active: true}
     */
    DOM.getPanel                = function(pActive){
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
            Util.log('Error can not find Active Panel');
        
        return lPanel;
    };
    
    /** prevent default event */
    DOM.preventDefault          = function(pEvent){
        var lRet,
            lPreventDefault = pEvent && pEvent.preventDefault,
            lFunc           = Util.bind(lPreventDefault, pEvent);
        
        lRet = Util.exec(lFunc);
        
        return lRet;
    };
    
    DOM.show                    = function(pElement){
        DOM.removeClass(pElement, 'hidden');
    };
    
    /**
     * shows panel right or left (or active)
     */
    DOM.showPanel               = function(pActive){
        var lRet = true,
            lPanel = DOM.getPanel(pActive);
                        
        if(lPanel)
            DOM.show(lPanel);
        else
            lRet = false;
        
        return lRet;
    };
    
    /**
     * hides panel right or left (or active)
     */
    DOM.hidePanel               = function(pActive){
        var lRet = false,
            lPanel = DOM.getPanel(pActive);
        
        if(lPanel)
            lRet = DOM.hide(lPanel);
        
        return lRet;
    };
    
    /**
     * add class=hidden to element
     * 
     * @param pElement
     */
    DOM.hide                    = function(pElement){
        return DOM.addClass(pElement, 'hidden');
    };
    
    /**
     * open window with URL
     * @param pUrl
     */
    DOM.openWindow              = function(pUrl){
        var left        = 140,
            top         = 187,
            width       = 1000,
            height      = 650,
            
            lOptions    = 'left='   + left          +
                ',top='             + top           +
                ',width='           + width         +
                ',height='          + height        +
                ',personalbar=0,toolbar=0'          +
                ',scrollbars=1,resizable=1';
            
        var lWind       = window.open(pUrl, 'Cloud Commander Auth', lOptions);
        if(!lWind)
            Util.log('Pupup blocked!');
    };
    
    /**
     * remove child of element
     * @param pChild
     * @param pElement
     */
    DOM.remove                  = function(pChild, pElement){
        return (pElement || document.body).removeChild(pChild);
    };
    
    /**
     * remove class pClass from element pElement
     * @param pElement
     * @param pClass
     */
    DOM.removeClass             = function(pElement, pClass){
        var lRet_b = true,
            lClassList = pElement.classList;
        
        if(pElement && lClassList)
           lClassList.remove(pClass);
        
        else
            lRet_b = false;
        
        return lRet_b;
    };
    
    /**
     * remove current file from file table
     * @pCurrent
     */
    DOM.removeCurrent           = function(pCurrent){
        var lCurrent    = pCurrent || DOM.getCurrentFile(),
            lParent     = lCurrent.parentElement,
            lName       = DOM.getCurrentName(lCurrent);
        
        if(lCurrent && lParent){
            if(lName !== '..'){
                var lNext       = lCurrent.nextSibling;
                var lPrevious   = lCurrent.previousSibling;
                if(lNext)
                    DOM.setCurrentFile(lNext);
                else if(lPrevious)
                    DOM.setCurrentFile(lPrevious);
                            
                lParent.removeChild(lCurrent);
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
            
        return lCurrent;
    };
    
    /**
     * unified way to scrollIntoViewIfNeeded
     * (native suporte by webkit only)
     * @param pElement
     */
    DOM.scrollIntoViewIfNeeded  = function(pElement){
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
    DOM.getTime                 = function(){
        var date        = new Date(),
            hours       = date.getHours(),
            minutes     = date.getMinutes(),
            seconds     = date.getSeconds();
            
        minutes         = minutes < 10 ? '0' + minutes : minutes;
        seconds         = seconds < 10 ? '0' + seconds : seconds;
        
        return hours + ":" + minutes + ":" + seconds;
    };
    
    /**
     * array of all statuses of opertattions
     */
    DOM.CloudStatus             = [];
    
    /**
     * adds status of operation
     * @param pStatus
     */
    DOM.addCloudStatus          = function(pStatus){
        DOM.CloudStatus[DOM.CloudStatus.length] = pStatus;
    };
})(Util, DOM);