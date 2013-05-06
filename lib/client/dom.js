var CloudCommander, Util, DOM, CloudFunc;

(function(Util){
    'use strict';
    
    var DOMConstructor          = function(){},
        CURRENT_FILE            = 'current-file',
        SELECTED_FILE           = 'selected-file',
        XMLHTTP, Title,
        
        /* Обьект содержит функции для отображения картинок */
        ImagesProto             = function(){
            var LImagesProto          = function (){
                function getImage(pName){
                    var lId = pName + '-image',
                        lE  = DOMProto.getById(lId);
                    
                    if (!lE)
                        lE = DOMProto.anyload({
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
                
                DOMProto.hide(lErrorImage);
                
                var lCurrent;
                if(pPosition && pPosition.top)
                    lCurrent    = DOMProto.getRefreshButton().parentElement;
                else{
                    var lFile       = DOMProto.getCurrentFile();
                    lCurrent        = DOMProto.getByClass('name', lFile)[0];
                }
                
                /* show loading icon if it not showed */
                
                var lParent = lLoadingImage.parentElement;
                if(!lParent || (lParent && lParent !== lCurrent))
                    lCurrent.appendChild(lLoadingImage);
                
                lRet_b = DOMProto.show(lLoadingImage); /* показываем загрузку*/
                
                return lRet_b;
            };
            
            /**
             * hide load image
             */
            this.hideLoad = function(){
                
                DOMProto.hide( lImages.loading() );
            };
            
            /**
             * show error image (usualy after error on ajax request)
             */
            this.showError = function(jqXHR, textStatus, errorThrown){
                var lLoadingImage   = lImages.loading(),
                    lErrorImage     = lImages.error(),
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
                
                
                DOMProto.show(lErrorImage);
                lErrorImage.title = lText;
                
                var lParent = lLoadingImage.parentElement;
                if(lParent)
                    lParent.appendChild(lErrorImage);
                
                DOMProto.hide(lLoadingImage);
                
                Util.log(lText);
                
                setTimeout( Util.retExec(alert, lText), 100);
            };
        },
        /* Обьект содержит функции для работы с CloudCmd API */
        RESTfullProto           = function(){
            this.delete = function(pUrl, pData, pCallBack, pQuery){
                sendRequest({
                    method      : 'DELETE',
                    url         : CloudFunc.FS + pUrl + (pQuery || ''),
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : { top: !!pData }
                });
            };
            
            this.save   = function(pUrl, pData, pCallBack){
                sendRequest({
                    method      : 'PUT',
                    url         : CloudFunc.FS + pUrl,
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
                if(lRet){
                    var p               = pParams;
                        
                    DOMProto.Images.showLoad( p.imgPosition );
                    CloudCommander.getConfig(function(pConfig){
                        var lData;
                        
                        if( Util.isString(p.url) )
                            p.url = decodeURI(p.url);
                        
                        if( p.data && !Util.isString(p.data))
                            lData = Util.stringifyJSON(p.data);
                        else
                            lData = p.data;
                        
                        p.url        = pConfig && pConfig.api_url + p.url,
                        DOMProto.ajax({
                            method  : p.method,
                            url     : p.url,
                            data    : lData,
                            error   : DOMProto.Images.showError,
                            success : function(pData){
                                DOMProto.Images.hideLoad();
                                Util.log(pData);
                                Util.exec(p.callback, pData);
                            }
                        });
                    });
                }
                
                return lRet;
            }
        },
        DOMTreeProto            = function(){
            /**
             * add class to element
             * 
             * @param pElement
             * @param pClass
             */
            this.addClass                = function(pElement, pClass){
                var lRet;
                
                if(pElement){
                    var lClassList  = pElement.classList;
                    lRet            = !this.isContainClass(pElement, pClass);
                    
                    if( lRet )
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
                    
                if( lClassList )
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
        },
        RESTfull                = function(){},
        Images                  = function(){},
        DOMTreeConstructor      = function(){},
        DOMTree,
        DOMProto;
    
    DOMTreeConstructor.prototype= new DOMTreeProto();
    DOMTree                     = new DOMTreeConstructor();
    
    DOMProto                    = new DOMTreeConstructor();
    DOMConstructor.prototype    = DOMProto;
    DOM                         = new DOMConstructor();
    
    RESTfull.prototype          = new RESTfullProto();
    DOMProto.RESTfull           = new RESTfull();
    
    Images.prototype            = new ImagesProto();
    DOMProto.Images             = new Images();
    
    /**
     * private function thet unset currentfile
     * 
     * @pCurrentFile
     */
    function unsetCurrentFile(pCurrentFile){
        var lRet = DOMProto.isCurrentFile(pCurrentFile);
        
        if(lRet)
            DOMProto.removeClass(pCurrentFile, CURRENT_FILE);
        
        return lRet;
    }
    
    
    /**
     * safe add event listener
     * 
     * @param pType
     * @param pListener
     * @param pUseCapture
     * @param pElement {document by default}
     */
    DOMProto.addListener             = function(pType, pListener, pElement, pUseCapture){
        var lRet        = this,
            lElement    = (pElement || window);
        
        if( lElement.addEventListener)
            lElement.addEventListener(
                pType,
                pListener,
                pUseCapture
            );
        
        return lRet;
    };
    
    /**
     * safe add event listener
     * 
     * @param pType
     * @param pListener
     * @param pUseCapture
     * @param pElement {document by default}
     */
    DOMProto.addOneTimeListener       = function(pType, pListener, pElement, pUseCapture){
        var lRet        = this,
            lOneTime    = function (pEvent){
                DOMProto.removeListener(pType, lOneTime, pElement, pUseCapture);
                pListener(pEvent);
            };
        
        DOMProto.addListener(pType, lOneTime, pElement, pUseCapture);
        
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
    DOMProto.removeListener             = function(pType, pListener, pElement, pUseCapture){
        var lRet = this;
        
        (pElement || window).removeEventListener(
            pType,
            pListener,
            pUseCapture
        );
        
        return lRet;
    };
    
    
    /**
     * safe add event keydown listener
     * 
     * @param pListener
     * @param pUseCapture
     */
    DOMProto.addKeyListener          = function(pListener, pElement, pUseCapture){
        return DOMProto.addListener('keydown', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * 
     * @param pListener
     * @param pUseCapture
     */
    DOMProto.addClickListener        = function(pListener, pElement, pUseCapture){
        return DOMProto.addListener('click', pListener, pElement, pUseCapture);
    };
    
    DOMProto.addContextMenuListener        = function(pListener, pElement, pUseCapture){
        return DOMProto.addListener('contextmenu', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * 
     * @param pListener
     * @param pUseCapture
     */
    DOMProto.addErrorListener        = function(pListener, pElement, pUseCapture){
        return DOMProto.addListener('error', pListener, pElement, pUseCapture);
    };
    
    /**
     * crossbrowser create event
     * 
     * @param pEventName
     * @param pKeyCode - not necessarily
     */
    DOMProto.createEvent             = function(pEventName, pKeyCode){
        var lEvent = document.createEvent('Event');
        
        lEvent.initEvent(pEventName, true, true);
        
        if(pKeyCode)
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
    DOMProto.createKeyEvent          = function(pKeyCode){
        return DOMProto.createEvent('keydown', pKeyCode);
    };
    
    /**
     * create click event
     * 
     * @param pKeyCode
     */
    DOMProto.createClickEvent          = function(){
        return DOMProto.createEvent('click');
    };
    
    /**
     * create click event
     * 
     * @param pKeyCode
     */
    DOMProto.createDblClickEvent          = function(){
        return DOMProto.createEvent('dblclick');
    };
    
    /**
     * dispatch event
     * 
     * @param pEvent
     */
    DOMProto.dispatch                = function(pEvent, pElement){
        return (pElement || window).dispatchEvent(pEvent);
    };
    
    /**
     * dispatch keydown event
     * 
     * @param pKeyCode
     * @param pElement
     */
    DOMProto.dispatchKeyEvent        = function(pKeyCode, pElement){
        var lEvent  = DOMProto.createKeyEvent(pKeyCode),
            lRet    = DOMProto.dispatch(lEvent, pElement);
        
        return lRet;
    };
    
    /**
     * dispatch click event
     * 
     * @param pElement
     */
    DOMProto.dispatchClickEvent        = function(pElement){
        var lEvent  = DOMProto.createClickEvent(),
            lRet    = DOMProto.dispatch(lEvent, pElement);
        
        return lRet;
    };
    
    /**
     * dispatch dblclick event
     * 
     * @param pElement
     */
    DOMProto.dispatchDblClickEvent        = function(pElement){
        var lEvent  = DOMProto.createDblClickEvent(),
            lRet    = DOMProto.dispatch(lEvent, pElement);
        
        return lRet;
    };
    
    
    /**
     * load file countent thrue ajax
     * 
     * @param pParams
     */
    DOMProto.ajax                    = function(pParams){
        var lRet = Util.checkObjTrue(pParams, ['url', 'success']);
        if(lRet){
            var p           = pParams,
                lType       = p.type || p.method || 'GET';
            
            if(!XMLHTTP)
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
                        if(lType && Util.isContainStr(lType, 'application/json') )
                            lData = Util.parseJSON(lJqXHR.response) || lJqXHR.response;

                        if( Util.isFunction(p.success) )
                            p.success(lData, lJqXHR.statusText, lJqXHR);
                    }
                    /* file not found or connection lost */
                    else{
                        /* if html given or something like thet
                         * getBack just status of result
                         */
                        if(lType && lType.indexOf('text/plain') !== 0)
                            lJqXHR.responseText = lJqXHR.statusText;
                        
                        Util.exec(p.error, lJqXHR);
                    }
                }
            };
        }
        return lRet;
    };
    
    /**
     * Обьект для работы с кэшем
     * в него будут включены функции для
     * работы с LocalStorage, webdb,
     * indexed db etc.
     */
    DOMProto.Cache                   = function(){
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
            var lRet;
            
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
    
    DOMProto.Cache = new DOMProto.Cache();
    
    /**
     * create new folder
     *
     * @pCurrentFile
     */
    DOMProto.promptNewDir        = function(){
        DOMProto.promptNewFile('directory', '?dir');
    };
    
    /**
     * create new file
     *
     * @pCurrentFile
     */
    DOMProto.promptNewFile       = function(pTypeName, pType){
        var lName   = DOMProto.getCurrentName(),
            lDir    = DOMProto.getCurrentDirPath(),
            lMsg    = 'New ' + pTypeName || 'File',
            lType   = Util.isString(pType) ? pType : '';
        
        if(lName === '..')
            lName = '';
        
        lName       = prompt(lMsg, lName);
        
        if(lName)
            DOMProto.RESTfull.save(lDir + lName + lType, null, CloudCommander.refresh);
    };
    
    
    
    /**
     * delete currentfile, prompt before it
     *
     * @pCurrentFile
     */
    DOMProto.promptDeleteSelected = function(pCurrentFile){
        var lRet,
            lCurrent, lQuery, lMsg,
            lName       = '',
            lMsgAsk     = 'Do you really want to delete the ',
            lMsgSel     = 'selected ',
            lFiles      = DOMProto.getSelectedFiles(),
            lSelected   = DOMProto.getSelectedNames(lFiles),
            i, n        = lSelected && lSelected.length;
            
        if(n > 1){
            for(i = 0; i < 5 && i < n; i++)
                lName += '\n' + lSelected[i];
            
            if(n >= 5)
                lName   += '\n...';
            
            lMsg    = lMsgAsk + lMsgSel + n + ' files/directoris?\n' + lName ;
            lQuery  = '?files';
        }else{
            var lType, lIsDir;
            
            /* dom element passed and it is not event */
            if( pCurrentFile && !pCurrentFile.pType)
                lCurrent = pCurrentFile;
            else
                lCurrent = DOMProto.getCurrentFile();
            
            lIsDir = DOMProto.isCurrentIsDir(lCurrent);
            
            if(lIsDir){
                lQuery  = '?dir';
                lType   ='directory';
            }
            else
                lType = 'file';
             
             lType += ' ';
            
            lName   = DOMProto.getCurrentName(lCurrent);
            lMsg    = lMsgAsk + lMsgSel + lType + lName + '?';
        }
        
        if(lName !== '..')
            lRet  = confirm(lMsg);
        else
            alert('No files selected!');
        if(lRet){
            var lUrl;
            
            if(lCurrent)
                lUrl = DOMProto.getCurrentPath(lCurrent);
            else{
                lUrl = DOMProto.getCurrentDirPath();
                lCurrent = lFiles[0];
            }
            
            if(lCurrent || lSelected)
                DOMProto.RESTfull.delete(lUrl, lSelected, function(){
                    if(n > 1)
                        DOMProto.deleteSelected(lFiles);
                    else
                        DOMProto.deleteCurrent(lCurrent);
                    
                    var lDir = CloudFunc.removeLastSlash(
                        DOMProto.getCurrentDirPath()
                    );
                    
                    DOMProto.Cache.remove(lDir);
                }, lQuery);
            
            return lCurrent;
        }
        
        return lRet;
    };
    
    /**
     * Function gets id by src
     * @param pSrc
     * 
     * Example: http://domain.com/1.js -> 1_js
     */
    DOMProto.getIdBySrc             = function(pSrc){
        var lRet    = Util.isString(pSrc);
        
        if(lRet){
            var lNum    = pSrc.lastIndexOf('/') + 1,
                lSub    = pSrc.substr(pSrc, lNum),
                lID     = Util.removeStrOneTime(pSrc, lSub );
            
            /* убираем точки */
            while(lID.indexOf('.') > 0)
                lID = lID.replace('.', '_');
            
            lRet = lID;
        }
        
        return lRet;
    },
    
    /**
     * create elements and load them to DOM-tree
     * one-by-one
     * 
     * @param pParams_a
     * @param pFunc - onload function
     */
    DOMProto.anyLoadOnLoad          = function(pParams_a, pFunc){
        var lRet = this;
        
        if( Util.isArray(pParams_a) ) {
            var lParam  = pParams_a.pop(),
                lFunc   = function(){
                    DOMProto.anyLoadOnLoad(pParams_a, pFunc);
                };
            
            if( Util.isString(lParam) )
                lParam = { src : lParam };
            else if( Util.isArray(lParam) ){
                
                DOMProto.anyLoadInParallel(lParam, lFunc);
            }
            
            if(lParam && !lParam.func){
                lParam.func = lFunc;
                
                DOMProto.anyload(lParam);
            
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
    DOMProto.anyLoadInParallel        = function(pParams_a, pFunc){
        var lRet = this,
            lDone = [],
            
            lDoneFunc = function (pCallBack){
                Util.exec(pCallBack);
                
                if( !lDone.pop() )
                    Util.exec(pFunc);
            };
        
        if( !Util.isArray(pParams_a) ){
            pParams_a = [pParams_a];
        }
        
        for(var i = 0, n = pParams_a.length; i < n; i++){
            var lParam = pParams_a.pop();
            
            if(lParam){
                lDone.push(i);
                
                if(Util.isString(lParam) )
                    lParam = { src : lParam };
                
                var lFunc = lParam.func;
                lParam.func = Util.retExec(lDoneFunc, lFunc);
                
                DOMProto.anyload(lParam);
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
    DOMProto.anyload                 = function(pParams_o){
        
        if( !pParams_o ) return;
        
        /* if a couple of params was
         * processing every of params
         * and quit
         */
        if( Util.isArray(pParams_o) ){
            var lElements_a = [];
            for(var i = 0, n = pParams_o.length; i < n ; i++)
                lElements_a[i] = DOMProto.anyload(pParams_o[i]);
            
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
            lID = DOMProto.getIdBySrc(lSrc);
                
        var lElement = DOMProto.getById(lID);
        
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
                    DOMProto.removeListener('load', lLoad, lElement);
                    DOMProto.removeListener('error', lError, lElement);
                    
                    Util.exec(lFunc, pEvent);
                },
                
                lError    = function(){
                    lParent.removeChild(lElement);
                                        
                    DOMProto.Images.showError({
                        responseText: 'file ' +
                        lSrc                  +
                        ' could not be loaded',
                        status : 404
                    });
                    
                    Util.exec(lOnError);
                };
            
            DOMProto.addListener('load', lLoad, lElement);
            DOMProto.addErrorListener(lError, lElement);
            
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
    DOMProto.jsload                  = function(pSrc, pFunc){
        if( Util.isArray(pSrc) ){
            for(var i=0; i < pSrc.length; i++)
                pSrc[i].name = 'script';
            
            return DOMProto.anyload(pSrc);
        }
        
        return DOMProto.anyload({
            name : 'script',
            src  : pSrc,
            func : pFunc
        });
    },
    
    /**
     * returns jsload functions
     */    
    DOMProto.retJSLoad               = function(pSrc, pFunc){
        var lRet = function(){
            return DOMProto.jsload(pSrc, pFunc);
        };
        
        return lRet;
    },
    
    
    /**
     * Функция создаёт елемент style и записывает туда стили 
     * @param pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */    
    DOMProto.cssSet                  = function(pParams_o){
        pParams_o.name      = 'style';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return DOMProto.anyload(pParams_o);
    },
    
    /**
     * Function loads external css files 
     * @pParams_o - структура параметров, заполняеться таким
     * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
     * все параметры опциональны
     */
    DOMProto.cssLoad                 = function(pParams_o){
         if( Util.isArray(pParams_o) ){
            for(var i = 0, n = pParams_o.length; i < n; i++){
                pParams_o[i].name = 'link';
                pParams_o[i].parent   = pParams_o.parent || document.head;                
            }
            
            return DOMProto.anyload(pParams_o);
        } 
        
        else if( Util.isString(pParams_o) )
            pParams_o = { src: pParams_o };
        
        pParams_o.name      = 'link';
        pParams_o.parent    = pParams_o.parent || document.head;
        
        return DOMProto.anyload(pParams_o);
    };
    
    /**
     * load jquery from google cdn or local copy
     * @param pCallBack
     */
    DOMProto.jqueryLoad              = function(pCallBack){
        /* загружаем jquery: */
        DOMProto.jsload('//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',{
            onload: Util.retExec(pCallBack),
            
            onerror: function(){
                DOMProto.jsload('/lib/client/jquery.js');
                
                /* if could not load jquery from google server
                 * maybe we offline, load font from local
                 * directory */
                DOMProto.cssSet({
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
    DOMProto.socketLoad              = function(pCallBack){
        DOMProto.jsload('/lib/client/socket.js', Util.retExec(pCallBack) );
    };
    
    
    /**
     * get current direcotory name
     */
    DOMProto.getCurrentDirName           = function(){
        var lRet,
            lSubstr,
            lPanel  = DOMProto.getPanel(),
            /* получаем имя каталога в котором находимся */
            lHref   = DOMProto.getByClass('path', lPanel);
        
        lHref       = lHref[0].textContent;
        
        lHref       = CloudFunc.removeLastSlash(lHref);
        lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
        lRet        = Util.removeStrOneTime(lHref, lSubstr + '/') || '/';
        
        return lRet;
    };
    
    /**
     * get current direcotory path
     */
    DOMProto.getCurrentDirPath       = function(pPanel){
        var lPanel  =  pPanel || DOMProto.getPanel(),
            lPath   = DOMProto.getByClass('path', lPanel)[0],
            lRet;
        
        if(lPath)
            lRet = lPath.textContent;
        
        return lRet;
    };
    
    /**
     * get current direcotory path
     */
    DOMProto.getNotCurrentDirPath       = function(){
        var lPanel  = DOMProto.getPanel(true),
            lPath   = DOMProto.getByClass('path', lPanel)[0],
            lRet;
        
        if(lPath)
            lRet = lPath.textContent;
        
        return lRet;
    };
    
    /**
     * unified way to get current file
     *
     * @pCurrentFile
     */
    DOMProto.getCurrentFile          = function(){
        var lRet = DOMProto.getByClass( CURRENT_FILE )[0];
        
        return lRet;
    };
    
    /**
     * unified way to get current file
     *
     * @pCurrentFile
     */
    DOMProto.getSelectedFiles         = function(){
        var lRet = DOMProto.getByClass(SELECTED_FILE);
        
        return lRet.length ? lRet : null;
    };
    
    /**
     * get size
     * @pCurrentFile
     */
    DOMProto.getCurrentSize          = function(pCurrentFile){
        var lRet,
            lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lSize       = DOMProto.getByClass('size', lCurrent);
            lSize       = lSize[0].textContent;
            /* если это папка - возвращаем слово dir вместо размера*/
            lRet        = Util.removeStrOneTime(lSize, ['<', '>']);
        
        return lRet;
    };
    
    /**
     * get size
     * @pCurrentFile
     */
    DOMProto.loadCurrentSize          = function(pCallBack, pCurrent){
        var lRet,
            lCurrent    = pCurrent || DOMProto.getCurrentFile(),
            lLink       = DOMProto.getCurrentPath(lCurrent),
            lName       = DOMProto.getCurrentName(lCurrent);
            /* если это папка - возвращаем слово dir вместо размера*/
        
        if(lName !== '..')
            DOMProto.RESTfull.read(lLink, function(pSize){
                DOMProto.setCurrentSize(pSize, lCurrent);
                Util.exec(pCallBack, lCurrent);
            }, '?size');
        
        return lRet;
    };
    
    /**
     * set size
     * @pCurrentFile
     */
    DOMProto.setCurrentSize          = function(pSize, pCurrentFile){
        var lCurrent        = pCurrentFile || DOMProto.getCurrentFile(),
            lSizeElement    = DOMProto.getByClass('size', lCurrent),
            lSize           = CloudFunc.getShortSize(pSize);
        
        lSizeElement[0].textContent = lSize;
    
    };
    
    /**
     * @pCurrentFile
     */
    DOMProto.getCurrentMode          = function(pCurrentFile){
        var lRet,
            lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lMode       = DOMProto.getByClass('mode', lCurrent);
            lRet        = lMode[0].textContent;
        
        return lRet;
    };
    
     /**
     * unified way to get current file content
     *
     * @pCallBack - callback function or data struct {sucess, error}
     * @pCurrentFile
     */
    DOMProto.getCurrentFileContent       = function(pParams, pCurrentFile){
        var lRet,
            lCurrentFile    = pCurrentFile ? pCurrentFile : DOMProto.getCurrentFile(),
            lParams         = pParams ? pParams : {},
            lPath           = DOMProto.getCurrentPath(lCurrentFile),
            lErrorWas       = pParams.error,
            lError          = function(jqXHR){
                Util.exec(lErrorWas);
                DOMProto.Images.showError(jqXHR);
            };
        
        if( Util.isFunction(lParams) )
            lParams.success = Util.retExec(pParams);
        
        lParams.error = lError;
        
        
        if( DOMProto.isCurrentIsDir(lCurrentFile) )
            lPath += '?json';
        
        if(!lParams.url)
            lParams.url = CloudFunc.FS + lPath;
        
        lRet    = DOMProto.ajax(lParams);
        
        return lRet;
    };
     
     /**
     * unified way to get current file content
     *
     * @pCallBack - function({data, name}){}
     * @pCurrentFile
     */
     DOMProto.getCurrentData             = function(pCallBack, pCurrentFile){
        
        var lParams,
            lCurrentFile    = pCurrentFile ? pCurrentFile : DOMProto.getCurrentFile(),
            lFunc = function(pData){
                var lName = DOMProto.getCurrentName(lCurrentFile);
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
            
        
        return DOMProto.getCurrentFileContent(lParams, lCurrentFile);
    };
    
    /**
     * unified way to get RefreshButton
     */
    DOMProto.getRefreshButton        = function(){
        var lPanel      = DOMProto.getPanel(),
            lRefresh    = DOMProto.getByClass(CloudFunc.REFRESHICON, lPanel),
            lRet        = lRefresh[0];
        
        return lRet;
    };
    
    
    /**
     * unified way to set current file
     */
    DOMProto.setCurrentFile          = function(pCurrentFile){
        var lRet,
            lCurrentFileWas = DOMProto.getCurrentFile();
        
        if(pCurrentFile){
            if (pCurrentFile.className === 'path')
                pCurrentFile = pCurrentFile.nextSibling;
            
            if (pCurrentFile.className === 'fm-header')
                pCurrentFile = pCurrentFile.nextSibling;
            
            if(lCurrentFileWas)
                unsetCurrentFile(lCurrentFileWas);
            
            DOMProto.addClass(pCurrentFile, CURRENT_FILE);
            
            /* scrolling to current file */
            DOMProto.scrollIntoViewIfNeeded(pCurrentFile);
            
            lRet = true;
        }
        
        return  lRet;
    };
    
    /**
     * select current file
     * @param pCurrent
     */
    DOMProto.setSelectedFile              = function(pCurrent){
        var lCurrent    = pCurrent || DOMProto.getCurrentFile(),
            lRet        = DOMProto.addClass(pCurrent, SELECTED_FILE);
        
        if(!lRet)
            DOMProto.unsetSelectedFile(lCurrent);
        
        return lRet;
    };
    
    /**
     * unselect current file
     * @param pCurrent
     */
    DOMProto.unsetSelectedFile              = function(pCurrent){
        var lCurrent    = pCurrent || DOMProto.getCurrentFile(),
            lRet        = DOMProto.removeClass(lCurrent, SELECTED_FILE);
        
        return lRet;
    };
    
    /**
     * setting history wrapper
     */
    DOMProto.setHistory              = function(pData, pTitle, pUrl){
        var lRet = window.history;
        
        if(lRet)
            history.pushState(pData, pTitle, pUrl);
        
        return lRet;
    };
    
    /**
     * set onclick handler on buttons f1-f10
     * @param pKey - 'f1'-'f10'
     */
    DOMProto.setButtonKey            = function(pKey, pFunc){
        Util.tryCatchLog(function(){
            CloudCommander.KeysPanel[pKey].onclick = pFunc;
        });
    };
    
    /**
     * set title with pName
     * create title element 
     * if it  absent
     * @param pName
     */    
    
    DOMProto.setTitle                = function(pName){
        if(!Title)
            Title =     DOMProto.getByTag('title')[0] ||
                        DOMProto.anyload({
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
    DOMProto.isCurrentFile           = function(pCurrent){
        var lRet;
        
        if( pCurrent )
            lRet = DOMProto.isContainClass(pCurrent, CURRENT_FILE);
        
        return lRet;
    };
    
    /**
     * selected file check
     * 
     * @param pCurrentFile
     */
    DOMProto.isSelected              = function(pSelected){
        var lRet;
        
        if( pSelected )
            lRet = DOMProto.isContainClass(pSelected, SELECTED_FILE);
        
        return lRet;
    };
    
    /**
     * check is current file is a directory
     * 
     * @param pCurrentFile
     */
    DOMProto.isCurrentIsDir            = function(pCurrent){
        var lCurrent    = pCurrent || DOMProto.getCurrentFile(),
            lFileType   = DOMProto.getByClass('mini-icon', lCurrent)[0],
            lRet        = DOMProto.isContainClass(lFileType, 'directory');
        
        return lRet;
    };
    
    
   /**
     * get link from current (or param) file
     * 
     * @param pCurrentFile - current file by default
     */
    DOMProto.getCurrentLink          = function(pCurrentFile){
        var lLink = DOMProto.getByTag( 'a', pCurrentFile || DOMProto.getCurrentFile() ),
            
            lRet = lLink.length > 0 ? lLink[0] : -1;
        
        return lRet;
    };
    
    /**
     * get link from current (or param) file
     * 
     * @param pCurrentFile - current file by default
     */
    DOMProto.getCurrentPath          = function(pCurrentFile){
        var lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lPath       = DOMProto.getCurrentLink( lCurrent ).href;
        
        lPath           = decodeURI(lPath);
        /* убираем адрес хоста*/
        lPath = Util.removeStrOneTime( lPath, [CloudCommander.HOST, CloudFunc.FS] );
        
        return lPath;
    };
    
    /**
     * get name from current (or param) file
     * 
     * @param pCurrentFile
     */
    DOMProto.getCurrentName          = function(pCurrentFile){
        var lCurrent = pCurrentFile || DOMProto.getCurrentFile(),
            lLink    = DOMProto.getCurrentLink( lCurrent );
            
        if( Util.isObject(lLink) )
           lLink = lLink.title || lLink.textContent;
        
        return lLink;
    };
    
    DOMProto.getSelectedNames        = function(pSelected){
        var lSelected   = pSelected || DOMProto.getSelectedFiles(),
            lRet        = lSelected ? [] : null;
            
        if(lRet){
            var lFirst  = lSelected[0],
                lName   = DOMProto.getCurrentName( lFirst );
                
            if(lName === '..')
                DOMProto.unsetSelectedFile( lFirst );
            
            for(var i = 0, n = lSelected.length; i < n;i++)
                lRet[i] = DOMProto.getCurrentName( lSelected[i] );
        }
        return lRet;
    };
    
    /**
     * set name from current (or param) file
     * 
     * @param pCurrentFile
     */
    DOMProto.setCurrentName          = function(pName, pCurrentFile){
        var lLink   = DOMProto.getCurrentLink( pCurrentFile ),
            lDir    = DOMProto.getCurrentDirName() + '/';
        
        lLink.title = lLink.textContent = pName;
        lLink.href  = lDir + pName;
        
        return lLink;
    };
    
    /** function getting FM
     * @param pPanel_o = {active: true}
     */
    DOMProto.getFM                   = function(){
        return DOMProto.getPanel().parentElement;
    };
    
    /** function getting panel active, or passive
     * @param pPanel_o = {active: true}
     */
    DOMProto.getPanel                = function(pActive){
        var lPanel = DOMProto.getCurrentFile().parentElement;
                            
        /* if {active : false} getting passive panel */
        if(pActive && !pActive.active){
            var lId = lPanel.id === 'left' ? 'right' : 'left';
            lPanel = DOMProto.getById(lId);
        }
        
        /* if two panels showed
         * then always work with passive
         * panel
         */
        if(window.innerWidth < CloudCommander.MIN_ONE_PANEL_WIDTH)
            lPanel = DOMProto.getById('left');
            
        
        if(!lPanel)
            Util.log('Error can not find Active Panel');
        
        return lPanel;
    };
    
    /** prevent default event */
    DOMProto.preventDefault          = function(pEvent){
        var lRet,
            lPreventDefault = pEvent && pEvent.preventDefault,
            lFunc           = Util.bind(lPreventDefault, pEvent);
        
        lRet = Util.exec(lFunc);
        
        return lRet;
    };
    
    DOMProto.show                    = function(pElement){
        DOMProto.removeClass(pElement, 'hidden');
    };
    
    /**
     * shows panel right or left (or active)
     */
    DOMProto.showPanel               = function(pActive){
        var lRet = true,
            lPanel = DOMProto.getPanel(pActive);
                        
        if(lPanel)
            DOMProto.show(lPanel);
        else
            lRet = false;
        
        return lRet;
    };
    
    /**
     * hides panel right or left (or active)
     */
    DOMProto.hidePanel               = function(pActive){
        var lRet = false,
            lPanel = DOMProto.getPanel(pActive);
        
        if(lPanel)
            lRet = DOMProto.hide(lPanel);
        
        return lRet;
    };
    
    /**
     * add class=hidden to element
     * 
     * @param pElement
     */
    DOMProto.hide                    = function(pElement){
        return DOMProto.addClass(pElement, 'hidden');
    };
    
    /**
     * open window with URL
     * @param pUrl
     */
    DOMProto.openWindow              = function(pUrl){
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
    DOMProto.remove                  = function(pChild, pElement){
        return (pElement || document.body).removeChild(pChild);
    };
    
    /**
     * remove class pClass from element pElement
     * @param pElement
     * @param pClass
     */
    DOMProto.removeClass             = function(pElement, pClass){
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
    DOMProto.deleteCurrent           = function(pCurrent, pNextFile, pPreviousFile, pNotSet){
        var lCurrent    = pCurrent || DOMProto.getCurrentFile(),
            lParent     = lCurrent && lCurrent.parentElement,
            lName       = DOMProto.getCurrentName(lCurrent);
        
        if(lCurrent && lParent && lName !== '..'){
            var lNext       = pNextFile     || lCurrent.nextSibling,
                lPrevious   = pPreviousFile || lCurrent.previousSibling;
                
                if(!pNotSet)
                    if(lNext)
                        DOMProto.setCurrentFile(lNext);
                    else if(lPrevious)
                        DOMProto.setCurrentFile(lPrevious);
                
                lParent.removeChild(lCurrent);
        }
        
        return lCurrent;
    };
    
     /**
     * remove selected files from file table
     * @Selected
     */
    DOMProto.deleteSelected          = function(pSelected){
        var lSelected = pSelected || DOMProto.getSelectedFiles();
        
        if(lSelected){
            var n       = lSelected.length,
                lLast   = n-1,
                lNext   = lSelected[lLast].nextSibling,
                lPrev   = lSelected[0].previousSibling;
            
            /* lSelected[0] - becouse lSelected is a link to DOM so
             * when we remove 0 element, it's removed from lSelected to
             */
            for(var i = 0; i < n; i++)
                DOMProto.deleteCurrent( lSelected[0], lNext, lPrev, i !== lLast);
        }
        
        return lSelected;
    };
    
    /**
     * rename current file
     * 
     * @pCurrent
     */
    DOMProto.renameCurrent            = function(pCurrentFile){
        if( !DOMProto.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lFrom       = DOMProto.getCurrentName(lCurrent),
            lTo         = prompt('Rename', lFrom) || lFrom,
            lDirPath    = DOMProto.getCurrentDirPath();
        
        if( !Util.strCmp(lFrom, lTo) ){
            var lFiles      = {
                from    : lDirPath + lFrom,
                to      : lDirPath + lTo
            };
            
            DOMProto.RESTfull.mv(lFiles, function(){
                DOMProto.setCurrentName(lTo, lCurrent);
            });
        }
    };
    
    /**
     * move current file
     * 
     * @pCurrent
     */
    DOMProto.moveCurrent     = function(pCurrentFile){
        if( !DOMProto.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lName       = DOMProto.getCurrentName(lCurrent),
            lFromPath   = DOMProto.getCurrentPath(),
            lToPath     = DOMProto.getNotCurrentDirPath() + lName;
        
        lToPath         = prompt( 'Rename/Move file "' + lName + '"', lToPath );
        
        if( lToPath && !Util.strCmp(lFromPath, lToPath) ){
            var lFiles      = {
                from    : lFromPath,
                to      : lToPath
            };
            
            DOMProto.RESTfull.mv(lFiles, function(){
                DOMProto.deleteCurrent(lCurrent);
                
                var lPanel  = DOMProto.getPanel(true),
                lDotDot     = DOMProto.getById( '..(' + lPanel.id + ')');
                
                DOMProto.setCurrentFile ( lDotDot );
                CloudCommander.refresh();
            });
        }
    };
    
    /**
     * copy current file
     * 
     * @pCurrent
     */
    DOMProto.copyCurrent     = function(pCurrentFile){
        if( !DOMProto.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOMProto.getCurrentFile(),
            lName       = DOMProto.getCurrentName(lCurrent),
            lFromPath   = DOMProto.getCurrentPath(),
            lToPath     = DOMProto.getNotCurrentDirPath() + lName;
            lToPath     = prompt( 'Copy file "' + lName + '" to', lToPath );
        
        if( lToPath && !Util.strCmp(lFromPath, lToPath) ){
            var lFiles      = {
                from    : lFromPath,
                to      : lToPath
            };
            
            DOMProto.RESTfull.cp(lFiles, function(){
                var lPanel  = DOMProto.getPanel(true),
                    lDotDot = DOMProto.getById( '..(' + lPanel.id + ')');
                
                DOMProto.setCurrentFile ( lDotDot );
                CloudCommander.refresh();
            });
        }
    };
    
    /**
     * unified way to scrollIntoViewIfNeeded
     * (native suporte by webkit only)
     * @param pElement
     */
    DOMProto.scrollIntoViewIfNeeded  = function(pElement){
        var lRet = pElement && pElement.scrollIntoViewIfNeeded;
        
        if(lRet)
            pElement.scrollIntoViewIfNeeded();
        
        return lRet;
    };
    
    /* scroll on one page*/
    DOMProto.scrollByPages           = function(pElement, pPages){
       var lRet = pElement && pElement.scrollByPages && pPages;
        
        if(lRet)
            pElement.scrollByPages(pPages);
        
        return lRet;
    };
    
    /** 
     * function gets time
     */
    DOMProto.getTime                 = function(){
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
    
})(Util);