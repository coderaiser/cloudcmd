var Util, DOM;

(function (Util, DOMTree) {
    'use strict';
    
    var DOMProto    = Object.getPrototypeOf(DOMTree);
    
    DOMProto.load   = new LoaderProto();
    
    function LoaderProto() {
        var Images  = DOM.Images,
            Events  = DOM.Events;
        
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
        function load (params) {
            var element, onError, type,
                p           = params,
                func        = p.func,
                isObj       = Util.isObject(func),
                name        = p.name,
                parent      = p.parent || document.body,
                
                /*
                 * if passed arguments function
                 * then it's onload by default
                 *
                 * if object - then onload and onerror
                 */
                funcLoad     = function(event) {
                    Events.remove('error', element, funcError);
                    
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
                p.id = load.getIdBySrc(p.src);
                    
            element = DOM.getById(p.id);
            
            if (element) {
                Util.exec(func);
            } else {
                element                 = document.createElement(name);
                
                if (name === 'script' || name === 'link')
                    Events.addOnce('load', element, funcLoad)
                          .addError(element, funcError);
                
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
        }
        
        /**
         * Function gets id by src
         * @param pSrc
         * 
         * Example: http://domain.com/1.js -> 1_js
         */
        load.getIdBySrc             = function(src) {
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
        load.ajax                    = function(params) {
            var p           = params, countProgress,
                type        = p.type || p.method || 'GET',
                xhr         = new XMLHttpRequest();
            
            xhr.open(type, p.url, true);
            
            if (p.responseType)
                xhr.responseType = p.responseType;
            
            Events.add('progress', xhr.upload, function(event) {
                var percent, count;
                
                if (event.lengthComputable) {
                    percent = (event.loaded / event.total) * 100;
                    count   = Math.round(percent);
                    
                    if (countProgress)
                        Images.setProgress(count);
                    
                    countProgress = true;
                }
            
            });
            
            Events.add('readystatechange', xhr, function(event) {
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
            });
            
            xhr.send(p.data);
        };
        
        load.ext                    = function(src, func) {
            var element,
                ext     =  Util.getExt(src);
            
            switch (ext) {
            case '.js':
                element = load.js(src, func);
                break;
            
            case '.css':
                element = load.css(src, func);
                break;
            
            default:
                element = load({
                    src     : src,
                    func    : func
                });
            }
            
            return element;
        };
        
        /**
         * create elements and load them to DOM-tree
         * one-by-one
         * 
         * @param params
         * @param callback
         */
        load.series                 = function(params, callback) {
            var funcs   = [];
            
            if (params) {
                funcs = params.map(function(url) {
                    return load.ext.bind(null, url);
                })
                .concat(callback);
                
                Util.exec.series(funcs);
            }
            
            return load;
        };
        
        /**
         * improve callback of funcs so
         * we pop number of function and
         * if it's last we call pCallBack
         * 
         * @param params
         * @param callback - onload function
         */
        load.parallel               = function(params, callback) {
            var funcs   = [];
            
            if (params) {
                funcs = params.map(function(url) {
                    return load.ext.bind(null, url);
                });
                Util.exec.parallel(funcs, callback);
            }
            
            return load;
        };
        
        /** 
         * Функция загружает js-файл
         * 
         * @param pSrc
         * @param pFunc
         */
        load.js                  = function(src, func) {
            var element = load({
                name : 'script',
                src  : src,
                func : func
            });
        
            return element;
        },
        
        load.css                = function(src, callback) {
            var element = load({
                name    : 'link',
                src     : src,
                parent  : document.head,
                func    : callback
            });
            
            return element;
        };
        
        /**
         * Функция создаёт елемент style и записывает туда стили 
         * @param pParams_o - структура параметров, заполняеться таким
         * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
         * все параметры опциональны
         */    
        load.style                  = function(params) {
            if (!params.name)
                params.name      = 'style';
            
            if (!params.parent)
                params.parent    = document.head;
            
            return load(params);
        },
        
        /**
         * load jquery from google cdn or local copy
         * @param pParams
         */
        load.jquery                     = function(paramObj) {
            var params  = paramObj || {},
                onload  = params.onload,
                onerror = params.onerror;
            
            /* загружаем jquery: */
            load('//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js', {
                onload  : onload,
                onerror : onerror
            });
        };
        
        return load;
    }
})(Util, DOM);
