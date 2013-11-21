var CloudCmd, Util, DOM, CloudFunc, Dialog;

(function(Util) {
    'use strict';
    
    var DOMFunc                     = function() {},
        DOMProto,
        
        DialogProto                 = function() {
            this.alert      = alert.bind(window);
            this.prompt     = prompt.bind(window);
            this.confirm    = confirm.bind(window);
        },
        
        ImagesProto                 = function() {
            var LImagesProto          = function() {
                function getImage(pName) {
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
                this.loading = function() {
                    return getImage('loading');
                };
                
                /* Функция создаёт картинку ошибки загрузки */
                this.error = function() {
                    return getImage('error');
                };
            },
            lImages = new LImagesProto();
            /** 
             * Function shows loading spinner
             * pPosition = {top: true};
             */   
            this.showLoad = function(pPosition) {
                var lLoadingImage   = lImages.loading(),
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
                
                DOM.show(lLoadingImage); /* показываем загрузку*/
                
                return lLoadingImage;
            };
            
            /**
             * hide load image
             */
            this.hideLoad = function() {
                DOM.hide( lImages.loading() );
            };
            
            /**
             * show error image (usualy after error on ajax request)
             */
            this.showError = function(jqXHR) {
                var lLoadingImage   = lImages.loading(),
                    lErrorImage     = lImages.error(),
                    lResponse       = '',
                    lStatusText     = '',
                    lStatus         = 0,
                    lText           = '';
                            
                if (jqXHR) {
                    lResponse       = jqXHR.responseText;
                    lStatusText     = jqXHR.statusText;
                    lStatus         = jqXHR.status;
                    lText           = lStatus === 404 ? lResponse : lStatusText;
                    
                    if (!lText)
                        if (Util.isString(jqXHR))
                            lText = jqXHR;
                        else
                            lText = '';
                }
                
                /* если файла не существует*/
                if (Util.isContainStr(lText, 'Error: ENOENT, '))
                    lText = lText.replace('Error: ENOENT, n','N');
                
                /* если не хватает прав для чтения файла*/
                else if (Util.isContainStr(lText, 'Error: EACCES,'))
                    lText = lText.replace('Error: EACCES, p','P');
                
                DOM.show(lErrorImage);
                lErrorImage.title = lText;
                
                var lParent = lLoadingImage.parentElement;
                if (lParent)
                    lParent.appendChild(lErrorImage);
                
                DOM.hide(lLoadingImage);
                
                if (lText) {
                    Util.log(lText);
                    setTimeout(Util.retFunc(Dialog.alert, lText), 100);
                }
                
                return lErrorImage;
            };
        },
        
        RESTfulProto                = function() {
            this.delete = function(pUrl, pData, pCallBack, pQuery) {
                sendRequest({
                    method      : 'DELETE',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: !!pData }
                });
            };
            
            this.save   = function(pUrl, pData, pCallBack, pQuery) {
                sendRequest({
                    method      : 'PUT',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: true }
                });
            };
            
            this.read   = function(pUrl, pCallBack, pQuery) {
                sendRequest({
                    method      : 'GET',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    callback    : pCallBack
                });
            };
            
             this.cp     = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/cp',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.zip    = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/zip',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.mv     = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/mv',
                    data        : pData,
                    callback    : pCallBack
                });
            };
            
            this.config    = function(pData, pCallBack) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/config',
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: true }
                });
            };
           
           function sendRequest(pParams) {
                var lRet = Util.checkObjTrue(pParams, ['method']);
                if (lRet) {
                    var p               = pParams;
                        
                    Images.showLoad( p.imgPosition );
                    CloudCmd.getConfig(function(pConfig) {
                        var lData;
                        
                        if ( Util.isString(p.url) )
                            p.url = decodeURI(p.url);
                        
                        if ( p.data                 &&
                            !Util.isString(p.data)  &&
                                !Util.isArrayBuffer(p.data))
                                    lData = Util.stringifyJSON(p.data);
                        else
                            lData = p.data;
                        
                        p.url        = pConfig && pConfig.apiURL + p.url,
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
        
        DOMTreeProto                = function() {
            var DOM                     = this;
            /**
             * add class to element
             * 
             * @param pElement
             * @param pClass
             */
            this.addClass                = function(pElement, pClass) {
               var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.add(pClass);
                
                return this;
            };
            
            /**
             * remove class pClass from element pElement
             * @param pElement
             * @param pClass
             */
            this.removeClass             = function(pElement, pClass) {
                var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.remove(pClass);
                
                return this;
            };
            
            this.toggleClass             = function(pElement, pClass) {
                var lRet        = pElement && pClass;
                
                if (lRet)
                   pElement.classList.toggle(pClass);
                
                return this;
            };
            
            /**
             * check class of element
             * 
             * @param pElement
             * @param pClass
             */
            this.isContainClass          = function(pElement, pClass) {
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
            this.getByTag                = function(pTag, pElement) {
                return (pElement || document).getElementsByTagName(pTag);
            };
            
            /**
             * Function search element by id
             * @param Id - className
             * @param pElement - element
             */
            this.getById                = function(pId, pElement) {
                return (pElement || document).getElementById(pId);
            };
            
            /**
             * Function search element by class name
             * @param pClass - className
             * @param pElement - element
             */
            this.getByClass              = function(pClass, pElement) {
                return (pElement || document).getElementsByClassName(pClass);
            };
            
            /**
             * add class=hidden to element
             * 
             * @param pElement
             */
            this.hide                    = function(pElement) {
                return DOM.addClass(pElement, 'hidden');
            };
            
            this.show                    = function(pElement) {
                return DOM.removeClass(pElement, 'hidden');
            };
        },
        
        EventsProto                 = function() {
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
            this.add                        = function(pType, pListener, pElement, pUseCapture) {
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
            this.addOnce                    = function(pType, pListener, pElement, pUseCapture) {
                var lRet        = this,
                    lOneTime    = function (pEvent) {
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
            this.remove                     = function(pType, pListener, pElement, pUseCapture) {
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
            this.addKey                     = function(pListener, pElement, pUseCapture) {
                return this.add('keydown', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addClick                   = function(pListener, pElement, pUseCapture) {
                return this.add('click', pListener, pElement, pUseCapture);
            };
            
            this.addContextMenu             = function(pListener, pElement, pUseCapture) {
                return this.add('contextmenu', pListener, pElement, pUseCapture);
            };
            
            /**
             * safe add event click listener
             * 
             * @param pListener
             * @param pUseCapture
             */
            this.addError                   = function(pListener, pElement, pUseCapture) {
                return this.add('error', pListener, pElement, pUseCapture);
            };
            
            /**
             * crossbrowser create event
             * 
             * @param pEventName
             * @param pKeyCode - not necessarily
             */
            this.create                     = function(pEventName, pKeyCode) {
                var lEvent = document.createEvent('Event');
                
                lEvent.initEvent(pEventName, true, true);
                
                if (pKeyCode)
                    lEvent.keyCode = pKeyCode;
                
                lEvent.isDefaultPrevented = function() {
                    return this.defaultPrevented;
                };
                
                return lEvent;
            };
            
            
            /**
             * create keydown event
             * 
             * @param pKeyCode
             */
            this.createKey                  = function(pKeyCode) {
                return this.create('keydown', pKeyCode);
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createClick                = function() {
                return this.create('click');
            };
            
            /**
             * create click event
             * 
             * @param pKeyCode
             */
            this.createDblClick             = function() {
                return this.create('dblclick');
            };
            
            /**
             * dispatch event
             * 
             * @param pEvent
             */
            this.dispatch                   = function(pEvent, pElement) {
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
            this.dispatchKey                = function(pKeyCode, pElement) {
                var lEvent  = this.createKey(pKeyCode),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch click event
             * 
             * @param pElement
             */
            this.dispatchClick              = function(pElement) {
                var lEvent  = this.createClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            /**
             * dispatch dblclick event
             * 
             * @param pElement
             */
            this.dispatchDblClick           = function(pElement) {
                var lEvent  = this.createDblClick(),
                    lRet    = this.dispatch(lEvent, pElement);
                
                return lRet;
            };
            
            function process(pAdd, pType, pListener, pElement, pUseCapture) {
                var i, n, 
                    lElement        = (pElement || window),
                    
                    lEventProcess   =  pAdd ?
                        lElement.addEventListener :
                        lElement.removeEventListener,
                    
                    lRet            = pType && lEventProcess,
                    lEvent          = '';
                
                lEventProcess       = lEventProcess.bind(lElement);
                
                if (lRet) {
                    if (Util.isString(pType) )
                        lEventProcess(
                            pType,
                            pListener,
                            pUseCapture
                        );
                    else if (Util.isArray(pType))
                        for (i = 0, n = pType.length; i < n; i++)
                            process(
                                pAdd,
                                pType[i],
                                pListener,
                                pElement,
                                pUseCapture
                            );
                    else if (Util.isObject(pType)) {
                        if (pListener)
                            pElement = pListener;
                        
                        for(lEvent in pType)
                            process(
                                pAdd,
                                lEvent,
                                pType[lEvent],
                                pElement,
                                pUseCapture
                            );
                    }
                }
            }
        },
        StorageProto                = function() {
            /* приватный переключатель возможности работы с кэшем */
            var StorageAllowed;
            
            /* функция проверяет возможно ли работать с кэшем каким-либо образом */
            this.isAllowed   = function() {
                var lRet = StorageAllowed && !!window.localStorage;
                return lRet;
            };
            
            /**
             * allow Storage usage
             */
            this.setAllowed = function(pAllowd) {
                StorageAllowed = pAllowd;
                
                return pAllowd;
            };
            
            /** remove element */
            this.remove      = function(pItem) {
                var lRet = this;
                
                if (StorageAllowed)
                    localStorage.removeItem(pItem);
                    
                return lRet;
            };
            
            /** если доступен localStorage и
             * в нём есть нужная нам директория -
             * записываем данные в него
             */
            this.set         = function(pName, pData) {
                var lRet = this;
                
                if (StorageAllowed && pName && pData)
                    localStorage.setItem(pName,pData);
                
                return lRet;
            },
            
            /** Если доступен Storage принимаем из него данные*/
            this.get        = function(pName) {
                var lRet;
                
                if (StorageAllowed)
                    lRet = localStorage.getItem(pName);
                    
                return lRet;
            },
            
            /* get all Storage from local storage */
            this.getAll     = function() {
                var lRet = null;
                
                if (StorageAllowed)
                    lRet = localStorage;
                
                return lRet;
            };
            
            /** функция чистит весь кэш для всех каталогов*/
            this.clear       = function() {
                var lRet = this;
                
                if (StorageAllowed)
                    localStorage.clear();
                
                return lRet;
            };
        },
        NotifyProto                 = function() {
            var Show, Allow,
                Notify          = this,
                Notification    = window.Notification;
            
            Events.add({
                'blur' :function() {
                    Show = true;
                },
                'focus': function() {
                    Show = false;
                }
            }, window);
            
            this.send       = function(msg) {
                CloudCmd.getConfig(function(config) {
                    var notify,
                        notifications   = config.notifications,
                        focus           = window.focus.bind(window),
                        granted         = Notify.check();
                    
                    if (notifications && granted && Show) {
                         notify = new Notification(msg, {
                             icon: '/img/favicon/favicon-notify.png',
                         });
                         
                         Events.addClick(focus, notify);
                    }
                });
            };
            
            this.check = function () {
                var ret, 
                    Not     = Notification,
                    perm    = Not && Not.permission;
                
                if (perm === 'granted')
                    ret = true;
                
                return ret;
            };
            
            this.request = function () {
                var Not = Notification;
                
                if (Not)
                    Not.requestPermission();
            };
        },
        
        LoaderProto                 = function() {
            var Loader  = this;
            
            /**
             * Function gets id by src
             * @param pSrc
             * 
             * Example: http://domain.com/1.js -> 1_js
             */
            this.getIdBySrc             = function(pSrc) {
                var lRet    = Util.isString(pSrc);
                
                if (lRet) {
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
            this.ajax                    = function(pParams) {
                var xhr, p, lType,
                    lRet        = Util.checkObjTrue(pParams, ['url', 'success']);
                
                if (lRet) {
                    p           = pParams,
                    lType       = p.type || p.method || 'GET';
                    xhr         = new XMLHttpRequest();
                    
                    xhr.open(lType, pParams.url, true);
                    
                    if (p.responseType)
                        xhr.responseType = p.responseType;
                    
                    Events.add('progress', function(event) {
                        var percent, count, msg;
                        
                        if (event.lengthComputable) {
                            percent = (event.loaded / event.total) * 100,
                            count   = Math.round(percent),
                            msg     = lType + ' ' + p.url + ': ' + count + '%';
                            Util.log(msg);
                        }
                            
                      }, xhr.upload);
                    
                    Events.add('readystatechange', function(pEvent) {
                        if (xhr.readyState === 4 /* Complete */) {
                            var lJqXHR      = pEvent.target,
                                TYPE_JSON   = 'application/json',
                                lType       = xhr.getResponseHeader('content-type');
                            
                            if (xhr.status === 200 /* OK */) {
                                var lData = lJqXHR.response;
                                
                                if (p.dataType !== 'text')
                                    /* If it's json - parse it as json */
                                    if (lType && Util.isContainStr(lType, TYPE_JSON) )
                                        lData = Util.parseJSON(lJqXHR.response) || lJqXHR.response;
                                    
                                    Util.exec(p.success, lData, lJqXHR.statusText, lJqXHR);
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
                    }, xhr);
                    
                    xhr.send(p.data);
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
            this.anyLoadOnLoad          = function(pParams_a, pFunc) {
                if ( Util.isArray(pParams_a) ) {
                    var lParam  = pParams_a.pop(),
                        lFunc   = function() {
                            Loader.anyLoadOnLoad(pParams_a, pFunc);
                        };
                    
                    if ( Util.isString(lParam) )
                        lParam = { src : lParam };
                    else if ( Util.isArray(lParam) ) {
                        
                        Loader.anyLoadInParallel(lParam, lFunc);
                    }
                    
                    if (lParam && !lParam.func) {
                        lParam.func = lFunc;
                        
                        Loader.anyload(lParam);
                    
                    }else
                        Util.exec(pFunc);
                }
                
                return Loader;
            };
            
            /**
             * improve callback of funcs so
             * we pop number of function and
             * if it's last we call pCallBack
             * 
             * @param pParams_a
             * @param pFunc - onload function
             */
            this.anyLoadInParallel        = function(pParams_a, pFunc) {
                var lDone = [],
                    
                    lDoneFunc = function (pCallBack) {
                        Util.exec(pCallBack);
                        
                        if ( !lDone.pop() )
                            Util.exec(pFunc);
                    };
                
                if ( !Util.isArray(pParams_a) ) {
                    pParams_a = [pParams_a];
                }
                
                for(var i = 0, n = pParams_a.length; i < n; i++) {
                    var lParam = pParams_a.pop();
                    
                    if (lParam) {
                        lDone.push(i);
                        
                        if (Util.isString(lParam) )
                            lParam = { src : lParam };
                        
                        var lFunc = lParam.func;
                        lParam.func = Util.retExec(lDoneFunc, lFunc);
                        
                        Loader.anyload(lParam);
                    }
                }
                
                return Loader;
            };
            
            /**
             * Функция создаёт элемент и загружает файл с src.
             * 
             * @param pParams_o = {
             * name, - название тэга
             * src', - путь к файлу
             * func, - обьект, содержаий одну из функций 
             *          или сразу две onload и onerror
             *          {onload: function() {}, onerror: function();}
             * style,
             * id,
             * element,
             * async, - true by default
             * inner: 'id{color:red, },
             * class, 
             * not_append - false by default
             * }
             */
            this.anyload                 = function(pParams_o) {
                var i, n, lElements_a;
                
                if ( !pParams_o ) return;
                
                /* if a couple of params was
                 * processing every of params
                 * and quit
                 */
                if ( Util.isArray(pParams_o) ) {
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
                
                if ( Util.isObject(lFunc) ) {
                    lOnError = lFunc.onerror;
                    lFunc  = lFunc.onload;
                }
                /* убираем путь к файлу, оставляя только название файла */
                if (!lID && lSrc)
                    lID = DOM.getIdBySrc(lSrc);
                        
                var lElement = DOMTree.getById(lID);
                
                /* если скрипт еще не загружен */
                if (!lElement) {
                    if (!lName && lSrc) {
                        
                        var lDot = lSrc.lastIndexOf('.'),
                            lExt =  lSrc.substr(lDot);
                        switch(lExt) {
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
                        if (lName === 'link') {
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
                        var lLoad     = function(pEvent) {
                                Events.remove('load', lLoad, lElement);
                                Events.remove('error', lError, lElement);
                                
                                Util.exec(lFunc, pEvent);
                            },
                            
                            lError    = function() {
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
            this.jsload                  = function(pSrc, pFunc) {
                var lRet = Loader.anyload({
                    name : 'script',
                    src  : pSrc,
                    func : pFunc
                });
            
                return lRet;
            },
            
            /**
             * returns jsload functions
             */    
            this.retJSLoad               = function(pSrc, pFunc) {
                var lRet = function() {
                    return Loader.jsload(pSrc, pFunc);
                };
                
                return lRet;
            },
            
            
            /**
             * Функция создаёт елемент style и записывает туда стили 
             * @param pParams_o - структура параметров, заполняеться таким
             * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
             * все параметры опциональны
             */    
            this.cssSet                  = function(pParams_o) {
                pParams_o.name      = 'style';
                pParams_o.parent    = pParams_o.parent || document.head;
                
                return Loader.anyload(pParams_o);
            },
            
            /**
             * Function loads external css files 
             * @pParams_o - структура параметров, заполняеться таким
             * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
             * все параметры опциональны
             */
            this.cssLoad                 = function(pParams_o) {
                 if ( Util.isArray(pParams_o) ) {
                    for(var i = 0, n = pParams_o.length; i < n; i++) {
                        pParams_o[i].name = 'link';
                        pParams_o[i].parent   = pParams_o.parent || document.head;                
                    }
                    
                    return Loader.anyload(pParams_o);
                } 
                
                else if ( Util.isString(pParams_o) )
                    pParams_o = { src: pParams_o };
                
                pParams_o.name      = 'link';
                pParams_o.parent    = pParams_o.parent || document.head;
                
                return Loader.anyload(pParams_o);
            };
            
            /**
             * load jquery from google cdn or local copy
             * @param pParams
             */
            this.jquery                     = function(pParams) {
                if (!pParams)
                    pParams = {};
                /* загружаем jquery: */
                Loader.jsload('//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js',{
                    onload  : pParams.onload,
                    onerror : pParams.onerror
                });
            };
            
        },
        CmdProto                    = function() {
            var Cmd                     = this,
                CURRENT_FILE            = 'current-file',
                SELECTED_FILE           = 'selected-file',
                Title;
            
            /**
             * private function thet unset currentfile
             * 
             * @pCurrentFile
             */
            function unsetCurrentFile(pCurrentFile) {
                var lRet = DOM.isCurrentFile(pCurrentFile);
                
                if (lRet)
                    DOM.removeClass(pCurrentFile, CURRENT_FILE);
                
                return lRet;
            }
            
            
              /**
             * load jquery from google cdn or local copy
             * @param pCallBack
             */
            this.jqueryLoad              = function(pCallBack) {
                CloudCmd.getConfig(function(config) {
                    var online = config.online && navigator.onLine;
                    
                    Util.ifExec(!online,
                        function() {
                            Loader.jsload('/lib/client/jquery.js', {
                                onload: pCallBack
                            });
                        },
                        function(callback) {
                            Loader.jquery({
                                onload: pCallBack,
                                onerror: callback
                            });
                        });
                });
            };
            
            /**
             * load socket.io
             * @param pCallBack
             */    
            this.socketLoad              = function(pCallBack) {
                Loader.jsload('/lib/client/socket.js', pCallBack);
            };
            
            /**
             * create new folder
             *
             */
            this.promptNewDir        = function() {
                Cmd.promptNewFile('directory', '?dir');
            };
            
            /**
             * create new file
             *
             * @pTypeName
             * @pType
             */
            this.promptNewFile       = function(pTypeName, pType) {
                var lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lMsg    = 'New ' + pTypeName || 'File',
                    lType   = Util.isString(pType) ? pType : '';
                
                if (lName === '..')
                    lName = '';
                
                lName       = Dialog.prompt(lMsg, lName);
                
                if (lName)
                    RESTful.save(lDir + lName + lType, null, CloudCmd.refresh);
            };
            
            /**
             * zip file
             *
             */
            this.zipFile      = function() {
                var lName   = Cmd.getCurrentName(),
                    lDir    = Cmd.getCurrentDirPath(),
                    lPath   = lDir + lName,
                    lFiles  = {
                        from    : lPath
                    };
                
                if (lName && lName !== '..')
                    RESTful.zip(lFiles, CloudCmd.refresh);
            };
            
            
            /**
             * delete currentfile, prompt before it
             *
             * @pCurrentFile
             */
            this.promptDeleteSelected = function(pCurrentFile) {
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
                    
                if (n > 1) {
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
                    
                    if (lIsDir) {
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
                    lRet  = Dialog.confirm(lMsg);
                else
                    Dialog.alert('No files selected!');
                
                if (lRet) {
                    var lUrl;
                    
                    if (lCurrent)
                        lUrl = Cmd.getCurrentPath(lCurrent);
                    else {
                        lUrl = Cmd.getCurrentDirPath();
                        lCurrent = lFiles[0];
                    }
                    
                    if (lCurrent || lSelected)
                        RESTful.delete(lUrl, lSelected, function() {
                            if (n > 1)
                                DOM.deleteSelected(lFiles);
                            else
                                DOM.deleteCurrent(lCurrent);
                            
                            var lDir = CloudFunc.removeLastSlash(
                                DOM.getCurrentDirPath()
                            );
                            
                            Storage.remove(lDir);
                        }, lQuery);
                    
                    return lCurrent;
                }
                
                return lRet;
            };
            
            
            /**
             * get current direcotory name
             */
            this.getCurrentDirName           = function() {
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
            this.getCurrentDirPath       = function(pPanel) {
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
            this.getNotCurrentDirPath       = function() {
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
            this.getCurrentFile          = function() {
                var lRet = this.getByClass( CURRENT_FILE )[0];
                
                return lRet;
            };
            
            /**
             * get current file by name
             */
            this.getCurrentFileByName       = function(pName) {
                var lRet, lPanel, lName;
                
                lPanel  = DOM.getPanel();
                lName   = pName + '(' +  lPanel.id + ')';
                lRet    = DOM.getById(lName);
                
                return lRet;
            };
            
            /**
             * unified way to get current file
             *
             * @pCurrentFile
             */
            this.getSelectedFiles         = function() {
                var lRet = this.getByClass(SELECTED_FILE);
                
                return lRet.length ? lRet : null;
            };
            
            /**
             * get size
             * @pCurrentFile
             */
            this.getCurrentSize          = function(pCurrentFile) {
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
            this.loadCurrentSize          = function(pCallBack, pCurrent) {
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                
                if (lName !== '..')
                    RESTful.read(lLink, function(pSize) {
                        DOM.setCurrentSize(pSize, lCurrent);
                        Util.exec(pCallBack, lCurrent);
                    }, '?size');
                
                return lRet;
            };
            
            /**
             * load hash
             * @pCurrentFile
             */
            this.loadCurrentHash          = function(pCallBack, pCurrent) {
                var lRet,
                    lCurrent    = pCurrent || this.getCurrentFile(),
                    lLink       = this.getCurrentPath(lCurrent),
                    lName       = this.getCurrentName(lCurrent);
                
                RESTful.read(lLink, pCallBack, '?hash');
                
                return lRet;
            };
            
            /**
             * set size
             * @pCurrentFile
             */
            this.setCurrentSize          = function(pSize, pCurrentFile) {
                var lCurrent        = pCurrentFile || this.getCurrentFile(),
                    lSizeElement    = this.getByClass('size', lCurrent),
                    lSize           = CloudFunc.getShortSize(pSize);
                
                lSizeElement[0].textContent = lSize;
            
            };
            
            /**
             * @pCurrentFile
             */
            this.getCurrentMode          = function(pCurrentFile) {
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
            this.getCurrentFileContent       = function(pParams, pCurrentFile) {
                var lRet,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : this.getCurrentFile(),
                    lParams         = pParams ? pParams : {},
                    lPath           = this.getCurrentPath(lCurrentFile),
                    lErrorWas       = pParams.error,
                    lError          = function(jqXHR) {
                        Util.exec(lErrorWas);
                        Images.showError(jqXHR);
                    };
                
                if ( Util.isFunction(lParams) )
                    lParams.success = Util.retExec(pParams);
                
                lParams.error = lError;
                
                
                if ( this.isCurrentIsDir(lCurrentFile) )
                    lPath           += '?json';
                else if (!lParams.dataType)
                    lParams.dataType = 'text';
                
                if (!lParams.url)
                    lParams.url = CloudFunc.FS + lPath;
                
                lRet    = this.ajax(lParams);
                
                return lRet;
            };
             
            /**
             * unified way to get current file content
             *
             * @pCallBack - function({data, name}) {}
             * @pCurrentFile
             */
             this.getCurrentData             = function(pCallBack, pCurrentFile) {
                var lParams,
                    isFromStorage,
                    lCurrentFile    = pCurrentFile ? pCurrentFile : this.getCurrentFile(),
                    lPath           =  DOM.getCurrentPath(lCurrentFile),
                    
                    lFunc           = function(pData) {
                        var lExt    = '.json',
                            lName   = DOM.getCurrentName(lCurrentFile);
                        
                        if (Util.isObject(pData)) {
                            pData = Util.stringifyJSON(pData);
                            
                            if (!Util.checkExtension(lName, lExt))
                                lName += lExt;
                        }
                        
                        if (!isFromStorage)
                            DOM.saveDataToStorage(lPath, pData);
                        
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
                
                DOM.getDataFromStorage(lPath, function(data) {
                    if (data) {
                        isFromStorage = true;
                        lFunc(data);
                    } else
                        DOM.getCurrentFileContent(lParams, lCurrentFile);
                });
            };
            
            
            /**
             * unified way to save current file content
             *
             * @pCallBack - function({data, name}) {}
             * @pCurrentFile
             */
             this.saveCurrentData             = function(pUrl, pData, pCallBack, pQuery) {
                RESTful.save(pUrl, pData, function() {
                    DOM.saveDataToStorage(pUrl, pData);
                }, pQuery);
            };
            
            /**
             * unified way to get RefreshButton
             */
            this.getRefreshButton        = function() {
                if (!CloudFunc)
                    console.trace();
                
                var lPanel      = this.getPanel(),
                    lRefresh    = this.getByClass(CloudFunc.REFRESHICON, lPanel),
                    lRet        = lRefresh[0];
                
                return lRet;
            };
            
            
            /**
             * unified way to set current file
             */
            this.setCurrentFile          = function(pCurrentFile) {
                var lRet,
                    lCurrentFileWas = this.getCurrentFile();
                
                if (pCurrentFile) {
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
            this.toggleSelectedFile              = function(pCurrent) {
                var lCurrent    = pCurrent || this.getCurrentFile(),
                    lRet        = this.toggleClass(pCurrent, SELECTED_FILE);
                
                return this;
            };
            
            this.toggleAllSelectedFiles         = function(pCurrent) {
                var i, n,
                    isStr       = Util.isString(pCurrent),
                    lCurrent    = !isStr && pCurrent || Cmd.getCurrentFile(),
                    lParent     = lCurrent.parentElement,
                    lNodes      = lParent.childNodes;
                
                /* not path and fm_header */
                for (i = 2, n = lNodes.length; i < n; i++)
                    DOM.toggleSelectedFile( lNodes[i] );
                
                return Cmd;
            };
            
            
            /**
             * setting history wrapper
             */
            this.setHistory              = function(pData, pTitle, pUrl) {
                var lRet = window.history;
                
                if (lRet)
                    history.pushState(pData, pTitle, pUrl);
                
                return lRet;
            };
            
            /**
             * set onclick handler on buttons f1-f10
             * @param pKey - 'f1'-'f10'
             */
            this.setButtonKey            = function(pKey, pFunc) {
                Events.addClick(pFunc, CloudCmd.KeysPanel[pKey]);
            };
            
            /**
             * set title with pName
             * create title element 
             * if it  absent
             * @param pName
             */    
            
            this.setTitle                = function(pName) {
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
            this.isCurrentFile           = function(pCurrent) {
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
            this.isSelected              = function(pSelected) {
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
            this.isCurrentIsDir            = function(pCurrent) {
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
            this.getCurrentLink          = function(pCurrentFile) {
                var lLink = this.getByTag( 'a', pCurrentFile || this.getCurrentFile() ),
                    
                    lRet = lLink.length > 0 ? lLink[0] : -1;
                
                return lRet;
            };
            
            /**
             * get link from current (or param) file
             * 
             * @param pCurrentFile - current file by default
             */
            this.getCurrentPath          = function(pCurrentFile) {
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
            this.getCurrentName          = function(pCurrentFile) {
                var lCurrent = pCurrentFile || this.getCurrentFile(),
                    lLink    = this.getCurrentLink( lCurrent );
                    
                if ( Util.isObject(lLink) )
                   lLink = lLink.title || lLink.textContent;
                
                return lLink;
            };
            
            this.getSelectedNames        = function(pSelected) {
                var lSelected   = pSelected || this.getSelectedFiles(),
                    lRet        = lSelected ? [] : null;
                    
                if (lRet) {
                    var lFirst  = lSelected[0],
                        lName   = this.getCurrentName( lFirst );
                        
                    if (lName === '..')
                        this.toggleSelectedFile( lFirst );
                    
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
            this.setCurrentName          = function(pName, pCurrentFile) {
                var lLink   = this.getCurrentLink( pCurrentFile ),
                    lDir    = this.getCurrentDirName() + '/';
                
                lLink.title = lLink.textContent = pName;
                lLink.href  = lDir + pName;
                
                return lLink;
            };
            
            /**
             * save data to storage
             * 
             * @param name
             * @param data
             * @param callback 
             */
            this.saveDataToStorage = function(name, data, callback) {
                CloudCmd.getConfig(function(config) {
                    var hash,
                        nameHash    = name + '-hash',
                        nameData    = name + '-data',
                        allowed     = config.localStorage,
                        isDir       = DOM.isCurrentIsDir();
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else {
                        hash = Storage.get(name + '-hash');
                        
                        DOM.loadCurrentHash(function(pHash) {
                            var isContain = Util.isContainStr(hash, 'error');
                            
                            if (!isContain && hash !== pHash) {
                                Storage.set(nameHash, pHash);
                                Storage.set(nameData, data);
                            }
                            
                            Util.exec(callback, hash);
                        });
                    }
                });
            };
            
            /**
             * save data to storage
             * 
             * @param name
             * @param data
             * @param callback 
             */
            this.getDataFromStorage = function(name, callback) {
                CloudCmd.getConfig(function(config) {
                    var hash, allowed   = config.localStorage,
                        isDir           = DOM.isCurrentIsDir();
                    
                    if (!allowed || isDir)
                        Util.exec(callback);
                    else {
                        hash = Storage.get(name + '-hash');
                        
                        if (!hash)
                            Util.exec(callback);
                        else
                            DOM.loadCurrentHash(function(pHash) {
                                var data,
                                    isContain = Util.isContainStr(hash, 'error');
                                
                                if (!isContain && hash === pHash)
                                    data = Storage.get(name + '-data');
                                
                                Util.exec(callback, data);
                            });
                    }
                });
            };
            
            /** function getting FM
             * @param pPanel_o = {active: true}
             */
            this.getFM                   = function() {
                return this.getPanel().parentElement;
            };
            
            /** function getting panel active, or passive
             * @param pPanel_o = {active: true}
             */
            this.getPanel                = function(pActive) {
                var lPanel = this.getCurrentFile().parentElement;
                                    
                /* if {active : false} getting passive panel */
                if (pActive && !pActive.active) {
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
            this.preventDefault          = function(pEvent) {
                var lRet,
                    lPreventDefault = pEvent && pEvent.preventDefault,
                    lFunc           = Util.bind(lPreventDefault, pEvent);
                
                lRet = Util.exec(lFunc);
                
                return lRet;
            };
            
            /**
             * shows panel right or left (or active)
             */
            this.showPanel               = function(pActive) {
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
            this.hidePanel               = function(pActive) {
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
            this.openWindow              = function(pUrl) {
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
            this.remove                  = function(pChild, pElement) {
                return (pElement || document.body).removeChild(pChild);
            };
            
            /**
             * remove current file from file table
             * @pCurrent
             */
            this.deleteCurrent           = function(pCurrent, pNextFile, pPreviousFile, pNotSet) {
                var lCurrent    = pCurrent || Cmd.getCurrentFile(),
                    lParent     = lCurrent && lCurrent.parentElement,
                    lName       = Cmd.getCurrentName(lCurrent);
                
                if (lCurrent && lParent && lName !== '..') {
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
            this.deleteSelected          = function(pSelected) {
                var lSelected = pSelected || this.getSelectedFiles();
                
                if (lSelected) {
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
            this.renameCurrent            = function(pCurrentFile) {
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lFrom       = Cmd.getCurrentName(lCurrent),
                    lTo         = Dialog.prompt('Rename', lFrom) || lFrom,
                    lDirPath    = Cmd.getCurrentDirPath();
                
                if ( !Util.strCmp(lFrom, lTo) ) {
                    var lFiles      = {
                        from    : lDirPath + lFrom,
                        to      : lDirPath + lTo
                    };
                    
                    RESTful.mv(lFiles, function() {
                        DOM.setCurrentName(lTo, lCurrent);
                    });
                }
            };
            
            /**
             * move current file
             * 
             * @pCurrent
             */
            this.moveCurrent     = function(pCurrentFile) {
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                
                lToPath         = Dialog.prompt('Rename/Move file "' + lName + '"', lToPath);
                
                if ( lToPath && !Util.strCmp(lFromPath, lToPath) ) {
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTful.mv(lFiles, function() {
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
            this.copyCurrent     = function(pCurrentFile) {
                if ( !Cmd.isCurrentFile(pCurrentFile) )
                    pCurrentFile = null;
                
                var lCurrent    = pCurrentFile || Cmd.getCurrentFile(),
                    lName       = Cmd.getCurrentName(lCurrent),
                    lFromPath   = Cmd.getCurrentPath(),
                    lToPath     = Cmd.getNotCurrentDirPath() + lName;
                    lToPath     = Dialog.prompt( 'Copy file "' + lName + '" to', lToPath );
                
                if ( lToPath && !Util.strCmp(lFromPath, lToPath) ) {
                    var lFiles      = {
                        from    : lFromPath,
                        to      : lToPath
                    };
                    
                    RESTful.cp(lFiles, function() {
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
            this.scrollIntoViewIfNeeded  = function(pElement) {
                var lRet = pElement && pElement.scrollIntoViewIfNeeded;
                
                if (lRet)
                    pElement.scrollIntoViewIfNeeded();
                
                return lRet;
            };
            
            /* scroll on one page*/
            this.scrollByPages           = function(pElement, pPages) {
               var lRet = pElement && pElement.scrollByPages && pPages;
                
                if (lRet)
                    pElement.scrollByPages(pPages);
                
                return lRet;
            };
            
            this.getType                = function(name, callback) {
                CloudCmd.getExt(function(extensions) {
                    var str, index,
                        ext = Util.getExtension(name);
                    ext     = extensions[ext];
                    
                    if (ext) {
                        index   = ext.indexOf('/') + 1;
                        ext     = ext.substr(index);
                    }
                    
                    Util.exec(callback, ext);
              });
            };
        },
        
        DOMTree                     = Util.extendProto(DOMTreeProto),
        Events                      = Util.extendProto(EventsProto),
        Notify                      = Util.extendProto(NotifyProto),
        Loader                      = Util.extendProto(LoaderProto),
        Images                      = Util.extendProto(ImagesProto),
        RESTful                     = Util.extendProto(RESTfulProto),
        Storage                       = Util.extendProto(StorageProto);
    
    DOMProto                        = DOMFunc.prototype = new CmdProto();
    
    Dialog                          = new DialogProto();
    
    Util.extend(DOMProto, [
        DOMTree,
        Loader, {
            Events  : Events,
            RESTful : RESTful,
            Images  : Images,
            Storage   : Storage,
            Notify  : Notify,
            Dialog  : Dialog
        }
    ]);
    
    DOM                             = new DOMFunc();
    
})(Util);
