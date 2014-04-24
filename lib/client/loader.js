var Util, DOM;

(function (Util, DOMTree) {
    'use strict';
    
    var Loader      = Util.extendProto(LoaderProto),
        DOMProto    = Object.getPrototypeOf(DOMTree);
    
    Util.extend(DOMProto, Loader);
    
    function LoaderProto() {
        var Images  = DOM.Images,
            Events  = DOM.Events,
            Loader  = this;
        
        /**
         * Function gets id by src
         * @param pSrc
         * 
         * Example: http://domain.com/1.js -> 1_js
         */
        this.getIdBySrc             = function(src) {
            var num, sub, id,
                isStr       = Util.isString(src);
            
            if (isStr) {
                num    = src.lastIndexOf('/') + 1,
                sub    = src.substr(src, num),
                id     = Util.removeStrOneTime(src, sub);
                
                /* убираем точки */
                while (id.indexOf('.') > 0)
                    id = id.replace('.', '_');
            }
            
            return id;
        };
        
        /**
         * load file countent via ajax
         * 
         * @param pParams
         */
        this.ajax                    = function(params) {
            var p           = params, countProgress,
                type        = p.type || p.method || 'GET',
                xhr         = new XMLHttpRequest();
            
            xhr.open(type, p.url, true);
            
            if (p.responseType)
                xhr.responseType = p.responseType;
            
            Events.add('progress', function(event) {
                var percent, count;
                
                if (event.lengthComputable) {
                    percent = (event.loaded / event.total) * 100;
                    count   = Math.round(percent);
                    
                    if (countProgress)
                        Images.setProgress(count);
                    
                    countProgress = true;
                }
            
            }, xhr.upload);
            
            Events.add('readystatechange', function(event) {
                var TYPE_JSON, type, data, isContain,
                    xhr         = event.target;
                
                if (xhr.readyState === 4 /* Complete */) {
                    Images.clearProgress();
                    TYPE_JSON   = 'application/json';
                    type        = xhr.getResponseHeader('content-type');
                    
                    if (xhr.status === 200 /* OK */) {
                        data        = xhr.response;
                        isContain   = Util.isContainStr(type, TYPE_JSON);
                        
                        if (p.dataType !== 'text')
                            /* If it's json - parse it as json */
                            if (type && isContain)
                                data = Util.parseJSON(xhr.response) || xhr.response;
                            
                            Util.exec(p.success, data, xhr.statusText, xhr);
                    }
                    /* file not found or connection lost */
                    else {
                        /* if html given or something like thet
                         * getBack just status of result
                         */
                        if (type && type.indexOf('text/plain') !== 0)
                            xhr.responseText = xhr.statusText;
                        
                        Util.exec(p.error, xhr);
                    }
                }
            }, xhr);
            
            xhr.send(p.data);
        };
        
        /**
         * create elements and load them to DOM-tree
         * one-by-one
         * 
         * @param params
         * @param callback - onload function
         */
        this.anyLoadOnLoad          = function(params, callback) {
            if (Util.isArray(params)) {
                var param   = params.shift(),
                    func    = function() {
                        Loader.anyLoadOnLoad(params, callback);
                    };
                
                if (!param)
                    Util.exec(callback);
                
                else if (Util.isArray(param))
                    Loader.anyLoadInParallel(param, callback);
                
                else { 
                    if (Util.isString(param))
                        param = {
                            src : param
                        };
                    
                    if (!param.func)
                        param.func = func;
                    
                    Loader.anyload(param);
                }
            }
            
            return Loader;
        };
        
        /**
         * improve callback of funcs so
         * we pop number of function and
         * if it's last we call pCallBack
         * 
         * @param params
         * @param callback - onload function
         */
        this.anyLoadInParallel        = function(params, callback) {
            var i, n, param, func,
                done        = [],
                
                doneFunc    = function (func) {
                    Util.exec(func);
                    
                    if (!done.pop())
                        Util.exec(callback);
                };
            
            if (!Util.isArray(params))
                params = [params];
            
            
            n = params.length;
            for (i = 0; i < n; i++) {
                param = params.pop();
                
                if (param) {
                    done.push(i);
                    
                    if (Util.isString(param))
                        param   = { src : param };
                    else
                        func        = param.func;
                    
                    param.func  = Util.retExec(doneFunc, func);
                    
                    Loader.anyload(param);
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
            
            if (!pParams_o ) return;
            
            /* if a couple of params was
             * processing every of params
             * and quit
             */
            if (Util.isArray(pParams_o)) {
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
            
            if (Util.isObject(lFunc)) {
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
                
                if (lSrc) {
                    /* if work with css use href */
                    if (lName === 'link') {
                        lElement.href = lSrc;
                        lElement.rel = 'stylesheet';
                    } else
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
             if (Util.isArray(pParams_o)) {
                for(var i = 0, n = pParams_o.length; i < n; i++) {
                    pParams_o[i].name = 'link';
                    pParams_o[i].parent   = pParams_o.parent || document.head;                
                }
                
                return Loader.anyload(pParams_o);
            } 
            
            else if (Util.isString(pParams_o))
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
            Loader.jsload('//ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js',{
                onload  : pParams.onload,
                onerror : pParams.onerror
            });
        };
    }
})(Util, DOM);
