var CloudCommander, Util, DOM = {}, CloudFunc;

(function(Util, DOM){
    'use strict';
    
    var CURRENT_FILE    = 'current-file',
        SELECTED_FILE   = 'selected-file',
        XMLHTTP,
        Title,
        
        /* Обьект содержит функции для отображения картинок */
        Images          = function (){
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
            
            /* Функция создаёт картинку загрузки*/
            this.loading = function(){
                return getImage('loading');
            };
            
            /* Функция создаёт картинку ошибки загрузки*/
            this.error = function(){
                return getImage('error');
            };
        },
        
        /* Обьект содержит функции для работы с CloudCmd API */
        RESTfull        = function(){
            this.delete = function(pUrl, pCallBack){
                sendRequest({
                    method      : 'DELETE',
                    url         : CloudFunc.FS + pUrl,
                    callback    : pCallBack
                });
            };
            
            this.save   = function(pUrl, pData, pCallBack){
                sendRequest({
                    method      : 'PUT',
                    url         : CloudFunc.FS + pUrl,
                    data        : pData,
                    callback    : pCallBack,
                    imgPosition : top
                });
            };
            
            this.read   = function(pUrl, pCallBack){
                sendRequest({
                    method      : 'GET',
                    url         : CloudFunc.FS + pUrl,
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
                    var p               = pParams,
                        lImgPosition    = p.imgPosition && p.imgPosition.top;
                        
                    DOM.Images.showLoad( lImgPosition );
                    CloudCommander.getConfig(function(pConfig){
                        var lData;
                        
                        if( Util.isString(p.url) )
                            p.url = decodeURI(p.url);
                        
                        if( p.data && !Util.isString(p.data))
                            lData = Util.stringifyJSON(p.data);
                        else
                            lData = p.data;
                        
                        p.url        = pConfig && pConfig.api_url + p.url,
                        DOM.ajax({
                            method  : p.method,
                            url     : p.url,
                            data    : lData,
                            error   : DOM.Images.showError,
                            success : function(pData){
                                DOM.Images.hideLoad();
                                Util.log(pData);
                                Util.exec(p.callback, pData);
                            }
                        });
                    });
                }
                
                return lRet;
            }
        };
    
    Images = new Images();
    
    DOM.RESTfull = new RESTfull();
    
    
    /**
     * private function thet unset currentfile
     * 
     * @pCurrentFile
     */
    function unSetCurrentFile(pCurrentFile){
        var lRet = DOM.isCurrentFile(pCurrentFile);
        
        if(lRet)
            DOM.removeClass(pCurrentFile, CURRENT_FILE);
        
        return lRet;
    }
    
    /**
     * add class to current element
     * 
     * @param pElement
     * @param pClass
     */
    DOM.addClass                = function(pElement, pClass){
        var lRet;
        
        if(pElement){
            var lClassList = pElement.classList;
            
            if(lClassList){
                lRet = !lClassList.contains(pClass);
                
                if( lRet )
                    lClassList.add(pClass);
            }
        }
        
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
    DOM.addListener             = function(pType, pListener, pElement, pUseCapture){
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
    DOM.addOneTimeListener       = function(pType, pListener, pElement, pUseCapture){
        var lRet        = this,
            lOneTime    = function (pEvent){
                DOM.removeListener(pType, lOneTime, pElement, pUseCapture);
                pListener(pEvent);
            };
        
        DOM.addListener(pType, lOneTime, pElement, pUseCapture);
        
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
    DOM.removeListener             = function(pType, pListener, pElement, pUseCapture){
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
    DOM.addKeyListener          = function(pListener, pElement, pUseCapture){
        return DOM.addListener('keydown', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * 
     * @param pListener
     * @param pUseCapture
     */
    DOM.addClickListener        = function(pListener, pElement, pUseCapture){
        return DOM.addListener('click', pListener, pElement, pUseCapture);
    };
    
    DOM.addContextMenuListener        = function(pListener, pElement, pUseCapture){
        return DOM.addListener('contextmenu', pListener, pElement, pUseCapture);
    };
    
    /**
     * safe add event click listener
     * 
     * @param pListener
     * @param pUseCapture
     */
    DOM.addErrorListener        = function(pListener, pElement, pUseCapture){
        return DOM.addListener('error', pListener, pElement, pUseCapture);
    };
    
    
    /**
     * load file countent thrue ajax
     * 
     * @param pParams
     */
    DOM.ajax                    = function(pParams){
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
    DOM.Cache                   = function(){
        /* приватный переключатель возможности работы с кэшем */
        var CacheAllowed;
        
        /* функция проверяет возможно ли работать с кэшем каким-либо образом */
        this.isAllowed   = function(){
            CacheAllowed = Util.isObject( window.localStorage );
            return CacheAllowed;
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
     * create new folder
     *
     * @pCurrentFile
     */
    DOM.promptNewFolder         = function(){
        var lName   = DOM.getCurrentName(),
            lDir    = DOM.getCurrentDirPath();
        
        if(lName === '..')
            lName = '';
        
        lName       = prompt("New directory", lName);
        
        if(lName)
            DOM.RESTfull.save(lDir + lName + '?dir', null, CloudCommander.refresh);
    };
    
    /**
     * delete currentfile, prompt before it
     *
     * @pCurrentFile
     */
    DOM.promptDeleteCurrent = function(pCurrentFile){
        var lRet,
            lCurrent,
            lName,
            lMsg = 'Are you sure thet you want delete ';
        
        /* dom element passed and it is not event */
        if( Util.isObject(pCurrentFile) && !pCurrentFile.type)
            lCurrent = pCurrentFile;
        else
            lCurrent = DOM.getCurrentFile();
            
        lName = DOM.getCurrentName(lCurrent);
        
        lRet  = confirm(lMsg + lName + '?');
        
        if(lRet){
            var lParent     = lCurrent.parentElement,
                lUrl        = DOM.getCurrentPath(lCurrent);
            
            if( DOM.isCurrentIsDir(lCurrent) )
                lUrl += '?dir';
            
            if(lCurrent && lParent && lName !== '..')
                DOM.RESTfull.delete(lUrl, function(){
                    DOM.deleteCurrent(lCurrent);
                });
            
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
    DOM.getIdBySrc             = function(pSrc){
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
                    DOM.removeListener('load', lLoad, lElement);
                    DOM.removeListener('error', lError, lElement);
                    
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
            DOM.addErrorListener(lError, lElement);
            
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
        DOM.jsload('//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js',{
            onload: Util.retExec(pCallBack),
            
            onerror: function(){
                DOM.jsload('/lib/client/jquery.js');
                
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
                                ' url("/font/DroidSansMono.woff") format("woff");}'
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
            else{
                var lFile       = DOM.getCurrentFile();
                lCurrent        = DOM.getByClass('name', lFile)[0];
            }
            
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
            
            setTimeout( Util.retExec(alert, lText), 100);
        }
    };
    
    /**
     * get current direcotory name
     */
    DOM.getCurrentDirName           = function(){
        var lRet,
            lSubstr,
            lPanel  = DOM.getPanel(),
            /* получаем имя каталога в котором находимся */
            lHref   = DOM.getByClass('path', lPanel);
        
        lHref       = lHref[0].textContent;
        
        lHref       = CloudFunc.removeLastSlash(lHref);
        lSubstr     = lHref.substr(lHref , lHref.lastIndexOf('/'));
        lRet        = Util.removeStrOneTime(lHref, lSubstr + '/') || '/';
        
        return lRet;
    };
    
    /**
     * get current direcotory path
     */
    DOM.getCurrentDirPath       = function(pPanel){
        var lPanel  =  pPanel || DOM.getPanel(),
            lPath   = DOM.getByClass('path', lPanel)[0],
            lRet;
        
        if(lPath)
            lRet = lPath.textContent;
        
        return lRet;
    };
    
    /**
     * get current direcotory path
     */
    DOM.getNotCurrentDirPath       = function(){
        var lPanel  = DOM.getPanel(true),
            lPath   = DOM.getByClass('path', lPanel)[0],
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
    DOM.getCurrentFile          = function(){
        var lRet = DOM.getByClass( CURRENT_FILE )[0];
        
        return lRet;
    };
    
    /**
     * unified way to get current file
     *
     * @pCurrentFile
     */
    DOM.getSelectedFiles         = function(){
        var lRet = DOM.getByClass(SELECTED_FILE);
        
        return lRet.length ? lRet : null;
    };
    
    /**
     * get size
     * @pCurrentFile
     */
    DOM.getCurrentSize          = function(pCurrentFile){
        var lRet,
            lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lSize       = DOM.getByClass('size', lCurrent);
            lSize       = lSize[0].textContent;
            /* если это папка - возвращаем слово dir вместо размера*/
            lRet        = Util.removeStrOneTime(lSize, ['<', '>']);
        
        return lRet;
    };
    
    /**
     * set size
     * @pCurrentFile
     */
    DOM.setCurrentSize          = function(pSize, pCurrentFile){
        var lCurrent        = pCurrentFile || DOM.getCurrentFile(),
            lSizeElement    = DOM.getByClass('size', lCurrent),
            lSize           = CloudFunc.getShortSize(pSize);
        
        lSizeElement[0].textContent = lSize;

    };
    
    /**
     *
     * @pCurrentFile
     */
    DOM.getCurrentMode          = function(pCurrentFile){
        var lRet,
            lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lMode       = DOM.getByClass('mode', lCurrent);
            lRet        = lMode[0].textContent;
        
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
            lCurrentFile    = pCurrentFile ? pCurrentFile : DOM.getCurrentFile(),
            lParams         = pParams ? pParams : {},
            lPath           = DOM.getCurrentPath(lCurrentFile),
            lErrorWas       = pParams.error,
            lError          = function(jqXHR){
                Util.exec(lErrorWas);
                DOM.Images.showError(jqXHR);
            };
        if( Util.isFunction(lParams) )
            lParams.success = Util.retExec(pParams);
        
        lParams.error = lError;
        
        
        if( DOM.isCurrentIsDir(lCurrentFile) )
            lPath += '?json';
        
        if(!lParams.url)
            lParams.url = CloudFunc.FS + lPath;
        
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
            lCurrentFile    = pCurrentFile ? pCurrentFile : DOM.getCurrentFile(),
            lFunc = function(pData){
                var lName = DOM.getCurrentName(lCurrentFile);
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
            
        
        return DOM.getCurrentFileContent(lParams, lCurrentFile);
    };
    
    /**
     * unified way to get RefreshButton
     */
    DOM.getRefreshButton        = function(){
        var lPanel      = DOM.getPanel(),
            lRefresh    = DOM.getByClass(CloudFunc.REFRESHICON, lPanel),
            lRet        = lRefresh[0];
        
        return lRet;
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
     * select current file
     * @param pCurrent
     */
    DOM.selectFile              = function(pCurrent){
        var lCurrent    = pCurrent || DOM.getCurrentFile(),
            lRet        = DOM.addClass(pCurrent, SELECTED_FILE);
        
        if(!lRet)
            DOM.unSelectFile(lCurrent);
        
        return lRet;
    };
    
    /**
     * unselect current file
     * @param pCurrent
     */
    DOM.unSelectFile              = function(pCurrent){
        var lCurrent    = pCurrent || DOM.getCurrentFile(),
            lRet        = DOM.removeClass(lCurrent, SELECTED_FILE);
        
        return lRet;
    };
    
    
    /**
     * setting history wrapper
     */
    DOM.setHistory              = function(pData, pTitle, pUrl){
        var lRet = window.history;
        
        if(lRet)
            history.pushState(pData, pTitle, pUrl);
        
        return lRet;
    };
    
    /**
     * set onclick handler on buttons f1-f10
     * @param pKey - 'f1'-'f10'
     */
    DOM.setButtonKey            = function(pKey, pFunc){
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
        var lClass      = pCurrentFile && pCurrentFile.className,
            lIsCurrent  = lClass && lClass.indexOf(CURRENT_FILE) >= 0;
        
        return lIsCurrent;
    };
    
    /**
     * check is current file is a directory
     * 
     * @param pCurrentFile
     */
    DOM.isCurrentIsDir            = function(pCurrentFile){
        var lSize   = DOM.getCurrentSize(pCurrentFile),
            lRet    = lSize === 'dir';
        
        return lRet;
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
    DOM.getCurrentName          = function(pCurrentFile){
        var lCurrent = pCurrentFile || DOM.getCurrentFile(),
            lLink    = DOM.getCurrentLink( lCurrent );
            
        if( Util.isObject(lLink) )
           lLink = lLink.title || lLink.textContent;
        
        return lLink;
    };
    
    /**
     * set name from current (or param) file
     * 
     * @param pCurrentFile
     */
    DOM.setCurrentName          = function(pName, pCurrentFile){
        var lCurrent = pCurrentFile || DOM.getCurrentFile(),
            lLink    = DOM.getCurrentLink( lCurrent );
        
        if(lLink)
           lLink.href = lLink.title = lLink.textContent = pName;
          
        lLink.href = CloudFunc.FS + DOM.getCurrentDirPath() + lLink.href;
        
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
    DOM.deleteCurrent           = function(pCurrent, pNextFile, pPreviousFile, pNotSet){
        var lCurrent    = pCurrent || DOM.getCurrentFile(),
            lParent     = lCurrent && lCurrent.parentElement,
            lName       = DOM.getCurrentName(lCurrent);
        
        if(lCurrent && lParent && lName !== '..'){
            var lNext       = pNextFile     || lCurrent.nextSibling,
                lPrevious   = pPreviousFile || lCurrent.previousSibling;
                
                if(!pNotSet)
                    if(lNext)
                        DOM.setCurrentFile(lNext);
                    else if(lPrevious)
                        DOM.setCurrentFile(lPrevious);
                
                lParent.removeChild(lCurrent);
        }
        
        return lCurrent;
    };
    
     /**
     * remove selected files from file table
     * @Selected
     */
    DOM.deleteSelected          = function(pSelected){
        var lSelected = pSelected || DOM.getSelectedFiles();
        
        if(lSelected){
            var n       = lSelected.length,
                lLast   = n-1,
                lNext   = lSelected[lLast].nextSibling,
                lPrev   = lSelected[0].previousSibling;
            
            /* lSelected[0] - becouse lSelected is a link to DOM so
             * when we remove 0 element, it's removed from lSelected to
             */
            for(var i = 0; i < n; i++)
                DOM.deleteCurrent( lSelected[0], lNext, lPrev, i !== lLast);
        }
        
        return lSelected;
    };
    
    /**
     * rename current file
     * 
     * @pCurrent
     */
    DOM.renameCurrent            = function(pCurrentFile){
        if( !DOM.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lFrom       = DOM.getCurrentName(lCurrent),
            lTo         = prompt('Rename', lFrom) || lFrom,
            lDirPath    = DOM.getCurrentDirPath();
        
        if( !Util.strCmp(lFrom, lTo) ){
            var lFiles      = {
                from    : lDirPath + lFrom,
                to      : lDirPath + lTo
            };
            
            DOM.RESTfull.mv(lFiles, function(){
                DOM.setCurrentName(lTo, lCurrent);
            });
        }
    };
    
    /**
     * move current file
     * 
     * @pCurrent
     */
    DOM.moveCurrent     = function(pCurrentFile){
        if( !DOM.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lName       = DOM.getCurrentName(lCurrent),
            lFromPath   = DOM.getCurrentPath(),
            lToPath     = DOM.getNotCurrentDirPath() + lName;
        
        lToPath         = prompt( 'Rename/Move file "' + lName + '"', lToPath );
        
        if( lToPath && !Util.strCmp(lFromPath, lToPath) ){
            var lFiles      = {
                from    : lFromPath,
                to      : lToPath
            };
            
            DOM.RESTfull.mv(lFiles, function(){
                DOM.deleteCurrent(lCurrent);
                
                var lPanel  = DOM.getPanel(true),
                lDotDot     = DOM.getById( '..(' + lPanel.id + ')');
                
                DOM.setCurrentFile ( lDotDot );
                CloudCommander.refresh();
            });
        }
    };
    
    /**
     * copy current file
     * 
     * @pCurrent
     */
    DOM.copyCurrent     = function(pCurrentFile){
        if( !DOM.isCurrentFile(pCurrentFile) )
            pCurrentFile = null;
        
        var lCurrent    = pCurrentFile || DOM.getCurrentFile(),
            lName       = DOM.getCurrentName(lCurrent),
            lFromPath   = DOM.getCurrentPath(),
            lToPath     = DOM.getNotCurrentDirPath() + lName;
            lToPath     = prompt( 'Copy file "' + lName + '" to', lToPath );
        
        if( lToPath && !Util.strCmp(lFromPath, lToPath) ){
            var lFiles      = {
                from    : lFromPath,
                to      : lToPath
            };
            
            DOM.RESTfull.cp(lFiles, function(){
                var lPanel  = DOM.getPanel(true),
                    lDotDot = DOM.getById( '..(' + lPanel.id + ')');
                
                DOM.setCurrentFile ( lDotDot );
                CloudCommander.refresh();
            });
        }
    };
    
    /**
     * unified way to scrollIntoViewIfNeeded
     * (native suporte by webkit only)
     * @param pElement
     */
    DOM.scrollIntoViewIfNeeded  = function(pElement){
        var lRet = pElement && pElement.scrollIntoViewIfNeeded;
        
        if(lRet)
            pElement.scrollIntoViewIfNeeded();
        
        return lRet;
    };
    
    /* scroll on one page*/
    DOM.scrollByPages           = function(pElement, pPages){
       var lRet = pElement && pElement.scrollByPages && pPages;
        
        if(lRet)
            pElement.scrollByPages(pPages);
        
        return lRet;
    };
    
    /** 
     * function gets time
     */
    DOM.getTime                 = function(){
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
    
})(Util, DOM);