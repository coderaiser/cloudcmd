var CloudCmd, Util, DOM, CloudFunc;

(function(Util){
    'use strict';
    
    var DOMFunc                     = function(){},
        DOMProto,
        
        ImagesProto                 = function(){
            var LImagesProto          = function (){
                function getImage(pName){
                    var lId = pName + '-image',
                        lE  = DOM.getById(lId);
                    
                    if (!lE)
                        lE = DOM.anyload({
                            name        : 'span',
                            className   : 'icon ' + pName,
                            id          : lId,
                            not_append  : true
                        });
                    
                    return lE;
                }
                    
                /* Функция создаёт картинку загрузки */
                this.loading = function(){
                    return getImage('loading');
                };
                
                /* Функция создаёт картинку ошибки загрузки */
                this.error = function(){
                    return getImage('error');
                };
            },
            lImages = new LImagesProto();
            /** 
             * Function shows loading spinner
             * pPosition = {top: true};
             */   
            this.showLoad = function(pPosition){
                var lRet_b,
                    lLoadingImage   = lImages.loading(),
                    lErrorImage     = lImages.error();
                
                DOM.hide(lErrorImage);
                
                var lCurrent;
                if (pPosition && pPosition.top)
                    lCurrent    = DOM.getRefreshButton().parentElement;
                else{
                    var lFile       = DOM.getCurrentFile();
                    lCurrent        = DOM.getByClass('name', lFile)[0];
                }
                
                /* show loading icon if it not showed */
                
                var lParent = lLoadingImage.parentElement;
                if (!lParent || (lParent && lParent !== lCurrent))
                    lCurrent.appendChild(lLoadingImage);
                
                lRet_b = DOM.show(lLoadingImage); /* показываем загрузку*/
                
                return lRet_b;
            };
            
            /**
             * hide load image
             */
            this.hideLoad = function(){
                DOM.hide( lImages.loading() );
            };
            
            /**
             * show error image (usualy after error on ajax request)
             */
            this.showError = function(jqXHR, textStatus, errorThrown){
                var lLoadingImage   = lImages.loading(),
                    lErrorImage     = lImages.error(),
                    lResponse       = jqXHR.responseText,
                    lStatusText     = jqXHR.statusText,
                    lStatus         = jqXHR.status,
                    lText           = (lStatus === 404 ? lResponse : lStatusText);
                            
                /* если файла не существует*/
                if ( Util.isContainStr(lText, 'Error: ENOENT, ') )
                    lText = lText.replace('Error: ENOENT, n','N');
                
                /* если не хватает прав для чтения файла*/
                else if ( Util.isContainStr(lText, 'Error: EACCES,') )
                    lText = lText.replace('Error: EACCES, p','P');
                
                
                DOM.show(lErrorImage);
                lErrorImage.title = lText;
                
                var lParent = lLoadingImage.parentElement;
                if (lParent)
                    lParent.appendChild(lErrorImage);
                
                DOM.hide(lLoadingImage);
                
                Util.log(lText);
                
                setTimeout( Util.retExec(alert, lText), 100);
            };
        },
        RESTfullProto               = function(){
            this.delete = function(pUrl, pData, pCallBack, pQuery){
                sendRequest({
                    method      : 'DELETE',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: !!pData }
                });
            };
            
            this.save   = function(pUrl, pData, pCallBack, pQuery){
                sendRequest({
                    method      : 'PUT',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: true }
                });
            };
            
            this.read   = function(pUrl, pCallBack, pQuery){
                sendRequest({
                    method      : 'GET',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    callback    : pCallBack
                });
            };
            
             this.cp     = function(pData, pCallBack){
                sendRequest({
                    method      : 'PUT',
                    url         : '/cp',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.mv     = function(pData, pCallBack){
                sendRequest({
                    method      : 'PUT',
                    url         : '/mv',
                    data        : pData,
                    callback    : pCallBack
                });
            };
           
           function sendRequest(pParams){
                var lRet = Util.checkObjTrue(pParams, ['method']);
                if (lRet){
                    var p               = pParams;
                        
                    Images.showLoad( p.imgPosition );
                    CloudCmd.getConfig(function(pConfig){
                        var lData;
                        
                        if ( Util.isString(p.url) )
                            p.url = decodeURI(p.url);
                        
                        if ( p.data && !Util.isString(p.data))
                            lData = Util.stringifyJSON(p.data);
                        else
                            lData = p.data;
                        
                        p.url        = pConfig && pConfig.api_url + p.url,
                        Loader.ajax({
                            method  : p.method,
                            url     : p.url,
                            data    : lData,
                            error   : Images.showError,
                            success : function(pData) {
                                Images.hideLoad();
                                Util.log(pData);
                                Util.exec(p.callback, pData);
                            }
                        });
                    });
                }
                
                return lRet;
            }
        },
        DOMTreeProto                = function(){
            /**
             * add class to element
             * 
             * @param pElement
             * @param pClass
             */
            this.addClass                = function(pElement, pClass){
                var lRet;
                
                if (pElement){
                    var lClassList  = pElement.classList;
                    lRet            = !this.isContainClass(pElement, pClass);
                    
                    if ( lRet )
                        lClassList.add(pClass);
                }
                
                return lRet;
            };
            
            /**
             * check class of element
             * 
             * @param pElement
             * @param pClass
             */
            this.isContainClass          = function(pElement, pClass){
                var lRet,
                    lClassList = pElement && pElement.classList;
                    
                if ( lClassList )
                    lRet = lClassList.contains(pClass);
                    
                return lRet;
            };
            
            /**
             * Function search element by tag
             * @param pTag - className
             * @param pElement - element
             */
            this.getByTag                = function(pTag, pElement){
                return (pElement || document).getElementsByTagName(pTag);
            };
            
            /**
             * Function search element by id
             * @param Id - className
             * @param pElement - element
             */
            this.getById                = function(pId, pElement){
                return (pElement || document).getElementById(pId);
            };
            
            /**
             * Function search element by class name
             * @param pClass - className
             * @param pElement - element
             */
            this.getByClass              = function(pClass, pElement){
                return (pElement || document).getElementsByClassName(pClass);
            };
            
            /**
             * add class=hidden to element
             * 
             * @param pElement
             */
            this.hide                    = function(pElement){
                return this.addClass(pElement, 'hidden');
            };
            
            this.show                    = function(pElement){
                this.removeClass(pElement, 'hidden');
            };
        },
        EventsProto                 = function(){
            var Events  = this,
                ADD     = true,
                REMOVE  = false;
                        
            /**
             * safe add event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.add                        = function(pType, pListener, pElement, pUseCapture){
                return process(
                    ADD,
                    pType,
                    pListener,
                    pElement,
                    pUseCapture
                );
            };
            
            /**
             * safe add event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.addOneTime                 = function(pType, pListener, pElement, pUseCapture){
                var lRet        = this,
                    lOneTime    = function (pEvent){
                        lRet.remove(pType, lOneTime, pElement, pUseCapture);
                        pListener(pEvent);
                    };
                
                this.add(pType, lOneTime, pElement, pUseCapture);
                
                return lRet;
            };
            
            /**
             * safe remove event listener
             * 
             * @param pType
             * @param pListener
             * @param pUseCapture
             * @param pElement {document by default}
             */
            this.remove                     = function(pType, pListener, pElement, pUseCapture){
               return process(
                    REMOVE,
                    pType,
                    pListener,
                    pElement,
                    pUseCapture
                );
            };
            
            
            /**
             * safe add event keydown listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addKey                     = function(pListener, pElement, pUseCapture){
                return this.add('keydown', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addClick                   = function(pListener, pElement, pUseCapture){
                return this.add('click', pListener, pElement, pUseCapture);
            };
            
            this.addContextMenu             = function(pListener, pElement, pUseCapture){
                return this.add('contextmenu', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addError                   = function(pListener, pElement, pUseCapture){
                return this.add('error', pListener, pElement, pUseCapture);
            };
            
            /**
             * crossbrowser create event
             * 
             * @param pEventName
             * @param pKeyCode - not necessarily
             */
            this.create                     = function(pEventName, pKeyCode){
                var lEvent = document.createEvent('Event');
                
                lEvent.initEvent(pEventName, true, true);
                
                if (pKeyCode)
                    lEvent.keyCode = pKeyCode;
                
                lEvent.isDefaultPrevented = function(){
                    return this.defaultPrevented;
                };
                
                return lEvent;
            };
            
            
            /**
             * create keydown event
             * 
             * @param pKeyCode
             */
            this.createKey                  = function(pKeyCode){
                return this.create('keydown', pKeyCode);
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createClick                = function(){
                return this.create('click');
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createDblClick             = function(){
                return this.create('dblclick');
            };
            
            /**
             * dispatch event
             * 
             * @param pEvent
             */
            this.dispatch                   = function(pEvent, pElement){
                var lRet, lEvent;
                
                if (Util.isString(pEvent))
                    lEvent = Events.create(pEvent);
                else
                    lEvent = pEvent;
                
                return (pElement || window).dispatchEvent(lEvent);
            };
            
            /**
             * dispatch keydown event
             * 
             * @param pKeyCode
             * @param pElement
             */
            this.dispatchKey                = function(pKeyCode, pElement){
                var lEvent  = this.createKey(pKeyCode),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch click event
             * 
             * @param pElement
             */
            this.dispatchClick              = function(pElement){
                var lEvent  = this.createClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch dblclick event
             * 
             * @param pElement
             */
            this.dispatchDblClick           = function(pElement){
                var lEvent  = this.createDblClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            function process(pAdd, pType, pListener, pElement, pUseCapture){
                var i, n, 
                    lElement        = (pElement || window),
                    
                    lEventProcess   =  pAdd ?
                        lElement.addEventListener :
                        lElement.removeEventListener,
                    
                    lProcessName    = pAdd ? 'add' : 'remove',
                    lProcess        = Events[lProcessName],
                    
                    lRet            = pType && lEventProcess,
                    lEvent          = '';
                
                lEventProcess       = lEventProcess.bind(lElement);
                
                if (lRet){
                    if (Util.isString(pType) )
                        lEventProcess(
                            pType,
                            pListener,
                            pUseCapture
                        );
                    else if (Util.isArray(pType))                        
                        for (i = 0, n = pType.length; i < n; i++)
                            lProcess(
                                pType[i],
                                pListener,
                                pElement,
                                pUseCapture
                            );
                    else if (Util.isObject(pType)){
                        if (pListener)
                            pElement = pListener;
                        
                        for(lEvent in pType)
                            lProcess(
                                lEvent,
                                pType[lEvent],
                                pElement,
                                pUseCapture
                            );
                    }
                }
            }
        },
        CacheProto                  = function(){
            /* приватный переключатель возможности работы с кэшем */
            var CacheAllowed;
            
            /* функция проверяет возможно ли работать с кэшем каким-либо образом */
            this.isAllowed   = function(){
                var lRet = CacheAllowed && window.localStorage;
                return lRet;
            };
            
            /**
             * allow cache usage
             */
            this.setAllowed = function(pAllowd){
                CacheAllowed = pAllowd;
                
                return pAllowd;
            };
            
            /** remove element */
            this.remove      = function(pItem){
                var lRet = this;
                
                if (CacheAllowed)
                    localStorage.removeItem(pItem);
                    
                return lRet;
            };
            
            /** если доступен localStorage и
             * в нём есть нужная нам директория -
             * записываем данные в него
             */
            this.set         = function(pName, pData){
                var lRet = this;
                
                if (CacheAllowed && pName && pData)
                    localStorage.setItem(pName,pData);
                
                return lRet;
            },
            
            /** Если доступен Cache принимаем из него данные*/
            this.get        = function(pName){
                var lRet;
                
                if (CacheAllowed)
                    lRet = localStorage.getItem(pName);
                    
                return lRet;
            },
            
            /* get all cache from local storage */
            this.getAll     = function(){
                var lRet = null;
                
                if (CacheAllowed)
                    lRet = localStorage;
                
                return lRet;
            };
            
            /** функция чистит весь кэш для всех каталогов*/
            this.clear       = function(){
                var lRet = this;
                
                if (CacheAllowed)
                    localStorage.clear();
                
                return lRet;
            };
        },
        LoaderProto                 = function(){
            var XMLHTTP;
            
            /**
             * Function gets id by src
             * @param pSrc
             * 
             * Example: http://domain.com/1.js -> 1_js
             */
            this.getIdBySrc             = function(pSrc){
                var lRet    = Util.isString(pSrc);
                
                if (lRet){
                    var lNum    = pSrc.lastIndexOf('/') + 1,
                        lSub    = pSrc.substr(pSrc, lNum),
                        lID     = Util.removeStrOneTime(pSrc, lSub );
                    
                    /* убираем точки */
                    while(lID.indexOf('.') > 0)
                        lID = lID.replace('.', '_');
                    
                    lRet = lID;
                }
                
                return lRet;
            };
            
                        /**
             * load file countent thrue ajax
             * 
             * @param pParams
             */
            this.ajax                    = function(pParams){
                var lRet = Util.checkObjTrue(pParams, ['url', 'success']);
                if (lRet){
                    var p           = pParams,
                        lType       = p.type || p.method || 'GET';
                    
                    if (!XMLHTTP)
                        XMLHTTP     = new XMLHttpRequest();
                    
                    XMLHTTP.open(lType, pParams.url, true);
                    XMLHTTP.send(p.data);
                    
                    XMLHTTP.onreadystatechange = function(pEvent){
                        if (XMLHTTP.readyState === 4 /* Complete */){
                            var lJqXHR = pEvent.target,
                                lType = XMLHTTP.getResponseHeader('content-type');
                            
                            if (XMLHTTP.status === 200 /* OK */){
                                var lData = lJqXHR.response;
                                
                                /* If it's json - parse it as json */
                                if (lType && Util.isContainStr(lType, 'application/json') )
                                    lData = Util.parseJSON(lJqXHR.response) || lJqXHR.response;
        
                                if ( Util.isFunction(p.success) )
                                    p.success(lData, lJqXHR.statusText, lJqXHR);
                            }
                            /* file not found or connection lost */
                            else{
                                /* if html given or something like thet
                                 * getBack just status of result
                                 */
                                if (lType && lType.indexOf('text/plain') !== 0)
                                    lJqXHR.responseText = lJqXHR.statusText;
                                
                                Util.exec(p.error, lJqXHR);
                            }
                        }
                    };
                }
                return lRet;
            };
            
            /**
             * create elements and load them to DOM-tree
             * one-by-one
             * 
             * @param pParams_a
             * @param pFunc - onload function
             */
            this.anyLoadOnLoad          = function(pParams_a, pFunc){
                var lRet = this;
                
                if ( Util.isArray(pParams_a) ) {
                    var lParam  = pParams_a.pop(),
                        lFunc   = function(){
                            Loader.anyLoadOnLoad(pParams_a, pFunc);
                        };
                    
                    if ( Util.isString(lParam) )
                        lParam = { src : lParam };
                    else if ( Util.isArray(lParam) ){
                        
                        this.anyLoadInParallel(lParam, lFunc);
                    }
                    
                    if (lParam && !lParam.func){
                        lParam.func = lFunc;
                        
                        this.anyload(lParam);
                    
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
            this.anyLoadInParallel        = function(pParams_a, pFunc){
                var lRet = this,
                    lDone = [],
                    
                    lDoneFunc = function (pCallBack){
                        Util.exec(pCallBack);
                        
                        if ( !lDone.pop() )
                            Util.exec(pFunc);
                    };
                
                if ( !Util.isArray(pParams_a) ){
                    pParams_a = [pParams_a];
                }
                
                for(var i = 0, n = pParams_a.length; i < n; i++){
                    var lParam = pParams_a.pop();
                    
                    if (lParam){
                        lDone.push(i);
                        
                        if (Util.isString(lParam) )
                            lParam = { src : lParam };
                        
                        var lFunc = lParam.func;
                        lParam.func = Util.retExec(lDoneFunc, lFunc);
                        
                        this.anyload(lParam);
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
            this.anyload                 = function(pParams_o){
                var i, n, lElements_a;
                
                if ( !pParams_o ) return;
                
                /* if a couple of params was
                 * processing every of params
                 * and quit
                 */
                if ( Util.isArray(pParams_o) ){
                    lElements_a = [];
                    for(i = 0, n = pParams_o.length; i < n ; i++)
                        lElements_a[i] = this.anyload(pParams_o[i]);
                    
                    return lElements_a;
                }
                
                var lName       = pParams_o.name,
                    lAttr       = pParams_o.attribute,
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
                if (!lID && lSrc)
                    lID = this.getIdBySrc(lSrc);
                        
                var lElement = DOMTree.getById(lID);
                
                /* если скрипт еще не загружен */
                if (!lElement){
                    if (!lName && lSrc){
                        
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
                    lElement                = document.createElement(lName);
                    
                    if (lID)
                        lElement.id         = lID;
                    
                    if (lClass)
                        lElement.className  = lClass;
                    
                    if(lSrc) {
                        /* if work with css use href */
                        if (lName === 'link'){
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
                                Events.remove('load', lLoad, lElement);
                                Events.remove('error', lError, lElement);
                                
                                Util.exec(lFunc, pEvent);
                            },
                            
                            lError    = function(){
                                lParent.removeChild(lElement);
                                                    
                                Images.showError({
                                    responseText: 'file ' +
                                    lSrc                  +
                                    ' could not be loaded',
                                    status : 404
                                });
                                
                                Util.exec(lOnError);
                            };
                        
                        Events.add('load', lLoad, lElement);
                        Events.addError(lError, lElement);
                    }
                    
                    if (lAttr)
                        for(i in lAttr)
                            lElement.setAttribute(i, lAttr[i]);
                    
                    if (lStyle)
                        lElement.style.cssText = lStyle;
                    
                    if (lAsync || lAsync === undefined)
                        lElement.async = true;
                    
                    if (!lNotAppend)
                        lParent.appendChild(lElement);
                    
                    if (lInner)
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
            this.jsload                  = function(pSrc, pFunc){
                var lRet = this.anyload({
                    name : 'script',
                    src  : pSrc,
                    func : pFunc
                });
		
		return lRet;
            },
            
            /**
             * returns jsload functions
             */    
            this.retJSLoad               = function(pSrc, pFunc){
                var lRet = function(){
                    return this.jsload(pSrc, pFunc);
                };
                
                return lRet;
            },
            
            
            /**
             * Функция создаёт елемент style и записывает туда стили 
             * @param pParams_o - структура параметров, заполняеться таким
             * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
             * все параметры опциональны
             */    
            this.cssSet                  = function(pParams_o){
                pParams_o.name      = 'style';
                pParams_o.parent    = pParams_o.parent || document.head;
                
                return this.anyload(pParams_o);
            },
            
            /**
             * Function loads external css files 
             * @pParams_o - структура параметров, заполняеться таким
             * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
             * все параметры опциональны
             */
            this.cssLoad                 = function(pParams_o){
                 if ( Util.isArray(pParams_o) ){
                    for(var i = 0, n = pParams_o.length; i < n; i++){
                        pParams_o[i].name = 'link';
                        pParams_o[i].parent   = pParams_o.parent || document.head;                
                    }
                    
                    return this.anyload(pParams_o);
                } 
                
                else if ( Util.isString(pParams_o) )
                    pParams_o = { src: pParams_o };
                
                pParams_o.name      = 'link';
                pParams_o.parent    = pParams_o.parent || document.head;
                
                return this.anyload(pParams_o);
            };
            
            /**
             * load jquery from google cdn or local copy
             * @param pParams
             */
            this.jquery                     = function(pParams){
                if (!pParams)
                    pParams = {};
                /* загружаем jquery: */
                Loader.jsload('//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',{
                    onload  : pParams.onload,
                    onerror : pParams.onerror
                });
            };
            
        },
        CmdProto                    = function(){
            var Cmd                     = this,
                CURRENT_FILE            = 'current-file',
                SELECTED_FILE           = 'selected-file',
                Title;
            
            /**
             * private function thet unset currentfile
             * 
             * @pCurrentFile
             */
            function unsetCurrentFile(pCurrentFile){
                var lRet = DOM.isCurrentFile(pCurrentFile);
                
                if (lRet)
                    DOM.removeClass(pCurrentFile, CURRENT_FILE);
                
                return lRet;
            }
            
            
              /**
             * load jquery from google cdn or local copy
             * @param pCallBack
             */
            this.jqueryLoad              = function(pCallBack){
                Loader.jquery({
                    onload: pCallBack,
                    
                    onerror: function(){
                        Loader.jsload('/lib/client/jquery.js');
                        
                        /* if could not load jquery from google server
                         * maybe we offline, load font from local
                         * directory */
                        Loader.cssSet({
                            id      :'local-droids-font',
                            element : document.head,
                            inner   :   '@font-face {font-family: "Droid Sans Mono";'           +
                                        'font-style: normal;font-weight: normal;'               +
                                        'src: local("Droid Sans Mono"), local("DroidSansMono"),'+
                                        ' url("/font/DroidSansMono.woff") format("woff");}'
                        });                   
                    }
                });
            };
            
            /**
             * load socket.io
             * @param pCallBack
             */    
            this.socketLoad              = function(pCallBack){
                Loader.jsload('/lib/client/socket.js', pCallBack);
            };
            
            /**
             * create new folder
             *
             * @pCurrentFile
             */
            this.promptNewDir        = function(){
                Cmd.promptNewFile('directory', '?dir');
            };
            
            /**
             * create new file
             *
             * @pCurrentFile
             */
            this.promptNewFile       = function(pTypeName, pType){
                var lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lMsg    = 'New ' + pTypeName || 'File',
                    lType   = Util.isString(pType) ? pType : '';
                
                if (lName === '..')
                    lName = '';
                
                lName       = prompt(lMsg, lName);
                
                if (lName)
                    RESTfull.save(lDir + lName + lType, null, CloudCmd.refresh);
            };
            
            
            /**
             * delete currentfile, prompt before it
             *
             * @pCurrentFile
             */
            this.promptDeleteSelected = function(pCurrentFile){
                var lRet,
                    lCurrent, lQuery, lMsg,
                    lName       = '',
                    lMsgAsk     = 'Do you really want to delete the ',
                    lMsgSel     = 'selected ',
                    lFiles      = Cmd.getSelectedFiles(),
                    lSelected   = Cmd.getSelectedNames(lFiles),
                    i, n        = lSelected && lSelected.length;
                
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                    
                if (n > 1){
                    for (i = 0; i < 5 && i < n; i++)
                        lName += '\n' + lSelected[i];
                    
                    if (n >= 5)
                        lName   += '\n...';
                    
                    lMsg    = lMsgAsk + lMsgSel + n + ' files/directoris?\n' + lName ;
                    lQuery  = '?files';
                }else{
                    var lType, lIsDir;
                    
                    /* dom element passed and it is not event */
                    if (pCurrentFile && !pCurrentFile.pType)
                        lCurrent = pCurrentFile;
                    else
                        lCurrent = Cmd.getCurrentFile();
                    
                    lIsDir = Cmd.isCurrentIsDir(lCurrent);
                    
                    if (lIsDir){
                        lQuery  = '?dir';
                        lType   ='directory';
                    }
                    else
                        lType = 'file';
                     
                     lType += ' ';
                    
                    lName   = Cmd.getCurrentName(lCurrent);
                    lMsg    = lMsgAsk + lMsgSel + lType + lName + '?';
                }
                
                if (lName !== '..')
                    lRet  = confirm(lMsg);
                else
                    alert('No files selected!');
                
                if (lRet) {
                    var lUrl;
                    
                    if (lCurrent)
                        lUrl = Cmd.getCurrentPath(lCurrent);
                    else {
                        lUrl = Cmd.getCurrentDirPath();
                        lCurrent = lFiles[0];
                    }
                    
                    if (lCurrent || lSelected)
                        RESTfull.delete(lUrl, lSelected, function(){
                            if (n > 1)
                                DOM.deleteSelected(lFiles);
                            else
                                DOM.deleteCurrent(lCurrent);
                            
                            var lDir = CloudFunc.removeLastSlash(
                                DOM.getCurrentDirPath()
                            );
                            
                            Cache.remove(lDir);
                        }, lQuery);
                    
                    return lCurrent;
                }
                
                return lRet;
            };
            
            
            /**
             * get current direcotory name
             */
            this.getCurrentDirName           = function(){
                var lRet,
                    lSubstr,
                    lPanel  = this.getPanel(),
                    /* получаем имя каталога в котором находимся */
                    lHref   = this.getByClass('path', lPanel);
                
                lHref       = lHref[0].textContent;
                
                lHref       = CloudFunc.removeLastSlash(lHref);
                lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
                lRet        = Util.removeStrOneTime(lHref, lSubstr + '/') || '/';
                
                return lRet;
            };
            
            /**
             * get current direcotory path
             */
            this.getCurrentDirPath       = function(pPanel){
                var lPanel  =  pPanel || this.getPanel(),
                    lPath   = this.getByClass('path', lPanel)[0],
                    lRet;
                
                if (lPath)
                    lRet = lPath.textContent;
                
                return lRet;
            };
            
            /**
             * get current direcotory path
             */
            this.getNotCurrentDirPath       = function(){
                var lPanel  = this.getPanel(true),
                    lPath   = this.getByClass('path', lPanel)[0],
                    lRet;
                
                if (lPath)
                    lRet = lPath.textContent;
                
                return lRet;
            };
            
            /**
             * unified way to get current file
             *
             * @pCurrentFile
             */
            this.getCurrentFile          = function(){
                var lRet = this.getByClass( CURRENT_FILE )[0];
                
                return lRet;
            };
            
            /**
             * unified way to get current file
             *
             * @pCurrentFile
             */
            this.getSelectedFiles         = function(){
                var lRet = this.getByClass(SELECTED_FILE);
                
                return lRet.length ? lRet : null;
            };
            
            /**
             * get size
             * @pCurrentFile
             */
            this.getCurrentSize          = function(pCurrentFile){
                var lRet,
                    lCurrent    = pCurrentFile || this.getCurrentFile(),
                    lSize       = this.getByClass('size', lCurrent);
                    lSize       = lSize[0].textContent;
                    /* если это папка - возвращаем слово dir вместо размера*/
                    lRet        = Util.removeStrOneTime(lSize, ['<', '>']);
                
                return lRet;
            };
            
            /**
             * get size
             * @pCurrentFile
             */
            this.loadCurrentSize          = function(pCallBack, pCurrent){
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                    /* если это папка - возвращаем слово dir вместо размера*/
                
                if (lName !== '..')
                    RESTfull.read(lLink, function(pSize){
                        DOM.setCurrentSize(pSize, lCurrent);
                        Util.exec(pCallBack, lCurrent);
                    }, '?size');
                
                return lRet;
            };
            
            /**
             * set size
             * @pCurrentFile
             */
            this.setCurrentSize          = function(pSize, pCurrentFile){
                var lCurrent        = pCurrentFile || this.getCurrentFile(),
                    lSizeElement    = this.getByClass('size', lCurrent),
                    lSize           = CloudFunc.getShortSize(pSize);
                
                lSizeElement[0].textContent = lSize;
            
            };
            
            /**
             * @pCurrentFile
             */
            this.getCurrentMode          = function(pCurrentFile){
                var lRet,
                    lCurrent    = pCurrentFile || this.getCurrentFile(),
                    lMode       = this.getByClass('mode', lCurrent);
                    lRet        = lMode[0].textContent;
                
                return lRet;
            };
            
             /**
             * unified way to get current file content
             *
             * @pCallBack - callback function or data struct {sucess, error}
             * @pCurrentFile
             */
            this.getCurrentFileContent       = function(pParams, pCurrentFile){
                var lRet,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : this.getCurrentFile(),
                    lParams         = pParams ? pParams : {},
                    lPath           = this.getCurrentPath(lCurrentFile),
                    lErrorWas       = pParams.error,
                    lError          = function(jqXHR){
                        Util.exec(lErrorWas);
                        Images.showError(jqXHR);
                    };
                
                if ( Util.isFunction(lParams) )
                    lParams.success = Util.retExec(pParams);
                
                lParams.error = lError;
                
                
                if ( this.isCurrentIsDir(lCurrentFile) )
                    lPath += '?json';
                
                if (!lParams.url)
                    lParams.url = CloudFunc.FS + lPath;
                
                lRet    = this.ajax(lParams);
                
                return lRet;
            };
             
            /**
             * unified way to get current file content
             *
             * @pCallBack - function({data, name}){}
             * @pCurrentFile
             */
             this.getCurrentData             = function(pCallBack, pCurrentFile){
                var lParams,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : this.getCurrentFile(),
                    lFunc = function(pData){
                        var lName = DOM.getCurrentName(lCurrentFile);
                        if ( Util.isObject(pData) ){
                            pData = Util.stringifyJSON(pData);
                            
                            var lExt = '.json';
                            if ( !Util.checkExtension(lName, lExt) )
                                lName += lExt;
                        }
                        
                        Util.exec(pCallBack, {
                            data: pData,
                            name: lName
                        });
                    };
                
                if ( !Util.isObject(pCallBack) )
                    lParams = lFunc;
                else
                    lParams = {
                        success : lFunc,
                        error   : pCallBack.error
                    };
                    
                
                return this.getCurrentFileContent(lParams, lCurrentFile);
            };
            
            /**
             * unified way to get RefreshButton
             */
            this.getRefreshButton        = function(){
                var lPanel      = this.getPanel(),
                    lRefresh    = this.getByClass(CloudFunc.REFRESHICON, lPanel),
                    lRet        = lRefresh[0];
                
                return lRet;
            };
            
            
            /**
             * unified way to set current file
             */
            this.setCurrentFile          = function(pCurrentFile){
                var lRet,
                    lCurrentFileWas = this.getCurrentFile();
                
                if (pCurrentFile){
                    if (pCurrentFile.className === 'path')
                        pCurrentFile = pCurrentFile.nextSibling;
                    
                    if (pCurrentFile.className === 'fm-header')
                        pCurrentFile = pCurrentFile.nextSibling;
                    
                    if (lCurrentFileWas)
                        unsetCurrentFile(lCurrentFileWas);
                    
                    this.addClass(pCurrentFile, CURRENT_FILE);
                    
                    /* scrolling to current file */
                    this.scrollIntoViewIfNeeded(pCurrentFile);
                    
                    lRet = true;
                }
                
                return  lRet;
            };
            
            /**
             * select current file
             * @param pCurrent
             */
            this.setSelectedFile              = function(pCurrent){
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lRet        = this.addClass(pCurrent, SELECTED_FILE);
                
                if (!lRet)
                    this.unsetSelectedFile(lCurrent);
                
                return lRet;
            };
            
            /**
             * unselect current file
             * @param pCurrent
             */
            this.unsetSelectedFile              = function(pCurrent){
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lRet        = this.removeClass(lCurrent, SELECTED_FILE);
                
                return lRet;
            };
            
            /**
             * setting history wrapper
             */
            this.setHistory              = function(pData, pTitle, pUrl){
                var lRet = window.history;
                
                if (lRet)
                    history.pushState(pData, pTitle, pUrl);
                
                return lRet;
            };
            
            /**
             * set onclick handler on buttons f1-f10
             * @param pKey - 'f1'-'f10'
             */
            this.setButtonKey            = function(pKey, pFunc){
                Events.addClick(pFunc, CloudCmd.KeysPanel[pKey]);
            };
            
            /**
             * set title with pName
             * create title element 
             * if it  absent
             * @param pName
             */    
            
            this.setTitle                = function(pName){
                if (!Title)
                    Title =     DOMTree.getByTag('title')[0] ||
                                Loader.anyload({
                                    name:'title',
                                    parentElement: document.head,
                                    innerHTML: pName
                                });
                if (Title)
                    Title.textContent = pName;
                
                return Title;
            };
            
            /**
             * current file check
             * 
             * @param pCurrentFile
             */
            this.isCurrentFile           = function(pCurrent){
                var lRet;
                
                if ( pCurrent )
                    lRet = this.isContainClass(pCurrent, CURRENT_FILE);
                
                return lRet;
            };
            
            /**
             * selected file check
             * 
             * @param pCurrentFile
             */
            this.isSelected              = function(pSelected){
                var lRet;
                
                if ( pSelected )
                    lRet = this.isContainClass(pSelected, SELECTED_FILE);
                
                return lRet;
            };
            
            /**
             * check is current file is a directory
             * 
             * @param pCurrentFile
             */
            this.isCurrentIsDir            = function(pCurrent){
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lFileType   = this.getByClass('mini-icon', lCurrent)[0],
                    lRet        = this.isContainClass(lFileType, 'directory');
                
                return lRet;
            };
            
            
           /**
             * get link from current (or param) file
             * 
             * @param pCurrentFile - current file by default
             */
            this.getCurrentLink          = function(pCurrentFile){
                var lLink = this.getByTag( 'a', pCurrentFile || this.getCurrentFile() ),
                    
                    lRet = lLink.length > 0 ? lLink[0] : -1;
                
                return lRet;
            };
            
            /**
             * get link from current (or param) file
             * 
             * @param pCurrentFile - current file by default
             */
            this.getCurrentPath          = function(pCurrentFile){
                var lCurrent    = pCurrentFile || this.getCurrentFile(),
                    lPath       = this.getCurrentLink( lCurrent ).href;
                
                lPath           = decodeURI(lPath);
                /* убираем адрес хоста*/
                lPath = Util.removeStrOneTime( lPath, [CloudCmd.HOST, CloudFunc.FS] );
                
                return lPath;
            };
            
            /**
             * get name from current (or param) file
             * 
             * @param pCurrentFile
             */
            this.getCurrentName          = function(pCurrentFile){
                var lCurrent = pCurrentFile || this.getCurrentFile(),
                    lLink    = this.getCurrentLink( lCurrent );
                    
                if ( Util.isObject(lLink) )
                   lLink = lLink.title || lLink.textContent;
                
                return lLink;
            };
            
            this.getSelectedNames        = function(pSelected){
                var lSelected   = pSelected || this.getSelectedFiles(),
                    lRet        = lSelected ? [] : null;
                    
                if (lRet){
                    var lFirst  = lSelected[0],
                        lName   = this.getCurrentName( lFirst );
                        
                    if (lName === '..')
                        this.unsetSelectedFile( lFirst );
                    
                    for(var i = 0, n = lSelected.length; i < n;i++)
                        lRet[i] = this.getCurrentName( lSelected[i] );
                }
                return lRet;
            };
            
            /**
             * set name from current (or param) file
             * 
             * @param pCurrentFile
             */
            this.setCurrentName          = function(pName, pCurrentFile){
                var lLink   = this.getCurrentLink( pCurrentFile ),
                    lDir    = this.getCurrentDirName() + '/';
                
                lLink.title = lLink.textContent = pName;
                lLink.href  = lDir + pName;
                
                return lLink;
            };
            
            /** function getting FM
             * @param pPanel_o = {active: true}
             */
            this.getFM                   = function(){
                return this.getPanel().parentElement;
            };
            
            /** function getting panel active, or passive
             * @param pPanel_o = {active: true}
             */
            this.getPanel                = function(pActive){
                var lPanel = this.getCurrentFile().parentElement;
                                    
                /* if {active : false} getting passive panel */
                if (pActive && !pActive.active){
                    var lId = lPanel.id === 'left' ? 'right' : 'left';
                    lPanel = this.getById(lId);
                }
                
                /* if two panels showed
                 * then always work with passive
                 * panel
                 */
                if (window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH)
                    lPanel = this.getById('left');
                    
                
                if (!lPanel)
                    Util.log('Error can not find Active Panel');
                
                return lPanel;
            };
            
            /** prevent default event */
            this.preventDefault          = function(pEvent){
                var lRet,
                    lPreventDefault = pEvent && pEvent.preventDefault,
                    lFunc           = Util.bind(lPreventDefault, pEvent);
                
                lRet = Util.exec(lFunc);
                
                return lRet;
            };
            
            /**
             * shows panel right or left (or active)
             */
            this.showPanel               = function(pActive){
                var lRet = true,
                    lPanel = this.getPanel(pActive);
                                
                if (lPanel)
                    this.show(lPanel);
                else
                    lRet = false;
                
                return lRet;
            };
            
            /**
             * hides panel right or left (or active)
             */
            this.hidePanel               = function(pActive){
                var lRet = false,
                    lPanel = this.getPanel(pActive);
                
                if (lPanel)
                    lRet = this.hide(lPanel);
                
                return lRet;
            };
                
            /**
             * open window with URL
             * @param pUrl
             */
            this.openWindow              = function(pUrl){
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
                if (!lWind)
                    Util.log('Pupup blocked!');
            };
            
            /**
             * remove child of element
             * @param pChild
             * @param pElement
             */
            this.remove                  = function(pChild, pElement){
                return (pElement || document.body).removeChild(pChild);
            };
            
            /**
             * remove class pClass from element pElement
             * @param pElement
             * @param pClass
             */
            this.removeClass             = function(pElement, pClass){
                var lRet_b = true,
                    lClassList = pElement.classList;
                
                if (pElement && lClassList)
                   lClassList.remove(pClass);
                
                else
                    lRet_b = false;
                
                return lRet_b;
            };
            
            /**
             * remove current file from file table
             * @pCurrent
             */
            this.deleteCurrent           = function(pCurrent, pNextFile, pPreviousFile, pNotSet){
                var lCurrent    = pCurrent || Cmd.getCurrentFile(),
                    lParent     = lCurrent && lCurrent.parentElement,
                    lName       = Cmd.getCurrentName(lCurrent);
                
                if (lCurrent && lParent && lName !== '..'){
                    var lNext       = pNextFile     || lCurrent.nextSibling,
                        lPrevious   = pPreviousFile || lCurrent.previousSibling;
                        
                        if (!pNotSet)
                            if (lNext)
                                this.setCurrentFile(lNext);
                            else if (lPrevious)
                                this.setCurrentFile(lPrevious);
                        
                        lParent.removeChild(lCurrent);
                }
                
                return lCurrent;
            };
            
             /**
             * remove selected files from file table
             * @Selected
             */
            this.deleteSelected          = function(pSelected){
                var lSelected = pSelected || this.getSelectedFiles();
                
                if (lSelected){
                    var n       = lSelected.length,
                        lLast   = n-1,
                        lNext   = lSelected[lLast].nextSibling,
                        lPrev   = lSelected[0].previousSibling;
                    
                    /* lSelected[0] - becouse lSelected is a link to DOM so
                     * when we remove 0 element, it's removed from lSelected to
                     */
                    for(var i = 0; i < n; i++)
                        this.deleteCurrent( lSelected[0], lNext, lPrev, i !== lLast);
                }
                
                return lSelected;
            };
            
            /**
             * rename current file
             * 
             * @pCurrent
             */
            this.renameCurrent            = function(pCurrentFile){
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lFrom       = Cmd.getCurrentName(lCurrent),
                    lTo         = prompt('Rename', lFrom) || lFrom,
                    lDirPath    = Cmd.getCurrentDirPath();
                
                if ( !Util.strCmp(lFrom, lTo) ){
                    var lFiles      = {
                        from    : lDirPath + lFrom,
                        to      : lDirPath + lTo
                    };
                    
                    RESTfull.mv(lFiles, function(){
                        DOM.setCurrentName(lTo, lCurrent);
                    });
                }
            };
            
            /**
             * move current file
             * 
             * @pCurrent
             */
            this.moveCurrent     = function(pCurrentFile){
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                
                lToPath         = prompt( 'Rename/Move file "' + lName + '"', lToPath );
                
                if ( lToPath && !Util.strCmp(lFromPath, lToPath) ){
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTfull.mv(lFiles, function(){
                        DOM.deleteCurrent(lCurrent);
                        
                        var lPanel  = DOM.getPanel(true),
                        lDotDot     = DOM.getById( '..(' + lPanel.id + ')');
                        
                        DOM.setCurrentFile ( lDotDot );
                        CloudCmd.refresh();
                    });
                }
            };
            
            /**
             * copy current file
             * 
             * @pCurrent
             */
            this.copyCurrent     = function(pCurrentFile){
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                    lToPath     = prompt( 'Copy file "' + lName + '" to', lToPath );
                
                if ( lToPath && !Util.strCmp(lFromPath, lToPath) ){
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTfull.cp(lFiles, function(){
                        var lPanel  = DOM.getPanel(true),
                            lDotDot = DOM.getById( '..(' + lPanel.id + ')');
                        
                        DOM.setCurrentFile ( lDotDot );
                        CloudCmd.refresh();
                    });
                }
            };
            
            /**
             * unified way to scrollIntoViewIfNeeded
             * (native suporte by webkit only)
             * @param pElement
             */
            this.scrollIntoViewIfNeeded  = function(pElement){
                var lRet = pElement && pElement.scrollIntoViewIfNeeded;
                
                if (lRet)
                    pElement.scrollIntoViewIfNeeded();
                
                return lRet;
            };
            
            /* scroll on one page*/
            this.scrollByPages           = function(pElement, pPages){
               var lRet = pElement && pElement.scrollByPages && pPages;
                
                if (lRet)
                    pElement.scrollByPages(pPages);
                
                return lRet;
            };
            
            /** 
             * function gets time
             */
            this.getTime                 = function(){
                var lRet,
                    lDate       = new Date(),
                    lHours      = lDate.getHours(),
                    lMinutes    = lDate.getMinutes(),
                    lSeconds    = lDate.getSeconds();
                    
                lMinutes        = lMinutes < 10 ? '0' + lMinutes : lMinutes;
                lSeconds        = lSeconds < 10 ? '0' + lSeconds : lSeconds;
                
                lRet            = lHours + ":" + lMinutes + ":" + lSeconds;
                
                return lRet;
            };
        },
        
        DOMTree                     = Util.extendProto(DOMTreeProto),
        Events                      = Util.extendProto(EventsProto),
        Loader                      = Util.extendProto(LoaderProto),
        Images                      = Util.extendProto(ImagesProto),
        RESTfull                    = Util.extendProto(RESTfullProto),
        Cache                       = Util.extendProto(CacheProto);
    
    DOMProto                        = DOMFunc.prototype = new CmdProto();
    
    Util.extend(DOMProto, [
        DOMTree,
        Loader, {
            Events  : Events,
            RESTfull: RESTfull,
            Images  : Images,
            Cache   : Cache
        }
    ]);
    
    DOM                         = new DOMFunc();
    
})(Util);
