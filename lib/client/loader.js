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
                id     = Util.rmStrOnce(src, sub);
                
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
         * @param callback
         */
        this.anyLoadOnLoad          = function(params, callback) {
            var param, func, isStr,
                isArray     = Util.isArray(params);
            
            if (isArray) {
                param   = params.shift();
                isArray = Util.isArray(param);
                isStr   = Util.isString(param),
                func    = function() {
                    Loader.anyLoadOnLoad(params, callback);
                };
                
                if (!param) {
                    Util.exec(callback);
                } else if (isArray) {
                    Loader.loadParallel(param, callback);
                } else {
                    if (isStr)
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
        this.loadParallel              = function(params, callback) {
            var funcs   = [],
                func    = function (param, callback) {
                    Loader.anyload({
                        src : param,
                        func: callback
                    });
                };
            
            if (params) {
                funcs = params.map(function(param) {
                    return Util.exec.with(func, param);
                });
                Util.exec.parallel(funcs, callback);
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
         * notAppend - false by default
         * }
         */
        this.anyload                 = function(params) {
            var element, ext, onError, type,
                p           = params,
                name        = params.name,
                func        = params.func,
                parent      = params.parent || document.body,
                isObj       = Util.isObject(func),
                
                /*
                 * if passed arguments function
                 * then it's onload by default
                 *
                 * if object - then onload and onerror
                 */
                funcLoad     = function(event) {
                    Events.remove('load', funcLoad, element);
                    Events.remove('error', funcError, element);
                    
                    Util.exec(func, event);
                },
                
                funcError    = function() {
                    var template    = 'file {{ src }} could not be loaded',
                        msg         = Util.render(template, {
                            src: p.src
                        });
                    
                    parent.removeChild(element);
                    
                    Images.showError(msg);
                    
                    Util.exec(onError);
                };
            
            if (isObj) {
                onError = func.onerror;
                func    = func.onload;
            }
            /* убираем путь к файлу, оставляя только название файла */
            if (!p.id && p.src)
                p.id = DOM.getIdBySrc(p.src);
                    
            element = DOM.getById(p.id);
            
            if (element) {
                Util.exec(func);
            } else {
                if (!name && p.src) {
                    ext =  Util.getExt(p.src);
                    
                    switch (ext) {
                    case '.js':
                        name = 'script';
                        break;
                    case '.css':
                        name = 'link';
                        parent = document.head;
                        break;
                    }
                }
                
                element                 = document.createElement(name);
                
                Events.add('load', funcLoad, element);
                Events.addError(funcError, element);
                
                if (p.id)
                    element.id          = p.id;
                
                if (p.className)
                    element.className   = p.className;
                
                if (p.src) {
                    /* if work with css use href */
                    if (name === 'link') {
                        element.href    = p.src;
                        element.rel     = 'stylesheet';
                    } else
                        element.src     = p.src;
                }
                
                if (p.attribute) {
                    type = Util.getType(p.attribute);
                    
                    switch(type) {
                    case 'string':
                        element.setAttribute(p.attribute, '');
                        break;
                    
                    case 'object':
                        Object.keys(p.attribute).forEach(function(name) {
                            element.setAttribute(name, p.attribute[name]);
                        });
                        break;
                    }
                }
                
                if (p.style)
                    element.style.cssText = p.style;
                
                if (p.async && name === 'script' || p.async === undefined)
                    element.async = true;
                
                if (!p.notAppend)
                    parent.appendChild(element);
                
                if (p.inner)
                    element.innerHTML = p.inner;
            }
            
            return element;
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
        this.jquery                     = function(paramObj) {
            var params  = paramObj || {},
                onload  = params.onload,
                onerror = params.onerror;
            
            /* загружаем jquery: */
            Loader.jsload('//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', {
                onload  : onload,
                onerror : onerror
            });
        };
    }
})(Util, DOM);
