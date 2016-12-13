/* global Util */
/* global DOM */
/* global Emitify */

(function (Util, DOM) {
    'use strict';
    
    /* global rendy */
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.load   = new LoaderProto(Util, DOM.Images, DOM.Events);
    
    function LoaderProto(Util, Images, Events) {
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
         *
         */
        function load(params) {
            var element, type,
                p           = params,
                func        = p.func,
                name        = p.name,
                parent      = p.parent || document.body,
                
                /*
                 * if passed arguments function
                 * then it's onload by default
                 *
                 * if object - then onload and onerror
                 */
                funcLoad     = function() {
                    var callback = func && func.onload || func;
                    
                    Events.remove('error', element, funcError);
                    
                    Util.exec(callback);
                },
                
                funcError    = function() {
                    var callback,
                        template    = 'file {{ src }} could not be loaded',
                        msg         = rendy(template, {
                            src: p.src
                        }),
                        
                        error       = new Error(msg);
                    
                    if (func)
                        callback = func.onerror || func.onload || func;
                    
                    parent.removeChild(element);
                    
                    Images.show.error(msg);
                    
                    Util.exec(callback, error);
                };
            
            /* убираем путь к файлу, оставляя только название файла */
            if (!p.id && p.src)
                p.id = load.getIdBySrc(p.src);
                    
            element = document.getElementById(p.id);
            
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
                    type = Util.type(p.attribute);
                    
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
                isStr       = Util.type.string(src);
            
            if (isStr) {
                if (~src.indexOf(':'))
                    src += '-join';
                
                num     = src.lastIndexOf('/') + 1,
                sub     = src.substr(src, num),
                id      = src.replace(sub, '');
                
                /* убираем точки */
                id      = id.replace(/\./g, '-');
            }
            
            return id;
        };
        
        /**
         * load file countent via ajax
         *
         * @param pParams
         */
        load.ajax                    = function(params) {
            var data,
                p           = params,
                isObject    = Util.type.object(p.data),
                isArray     = Util.type.array(p.data),
                isArrayBuf  = Util.type(p.data) === 'arraybuffer',
                type        = p.type || p.method || 'GET',
                headers     = p.headers || {},
                xhr         = new XMLHttpRequest();
            
            xhr.open(type, p.url, true);
            
            Object.keys(headers).forEach(function(name) {
                var value = headers[name];
                xhr.setRequestHeader(name, value);
            });
            
            if (p.responseType)
                xhr.responseType = p.responseType;
            
            if (!isArrayBuf && isObject || isArray)
                data    = Util.json.stringify(p.data);
            else
                data    = p.data;
            
            xhr.onreadystatechange = function(event) {
                var TYPE_JSON, type, data, isContain, notText,
                    xhr = event.target,
                    OK  = 200;
                
                if (xhr.readyState === xhr.DONE) {
                    Images.clearProgress();
                    TYPE_JSON   = 'application/json';
                    type        = xhr.getResponseHeader('content-type');
                    
                    if (xhr.status !== OK) {
                        Util.exec(p.error, xhr);
                    } else {
                        data        = xhr.response;
                        notText     = p.dataType !== 'text',
                        isContain   = ~type.indexOf(TYPE_JSON);
                        
                        if (type && isContain && notText)
                            data = Util.json.parse(xhr.response) || xhr.response;
                            
                        Util.exec(p.success, data, xhr.statusText, xhr);
                    }
                }
            };
            
            xhr.send(data);
        };
        
        load.put = function(url, body) {
            var emitter = Emitify(),
                xhr     = new XMLHttpRequest();
            
            url     = encodeURI(url);
            url     = url.replace('#', '%23');
            
            xhr.open('put', url, true);
            
            xhr.upload.onprogress = function(event) {
                var percent, count;
                
                if (event.lengthComputable) {
                    percent = (event.loaded / event.total) * 100;
                    count   = Math.round(percent);
                    
                    emitter.emit('progress', count);
                }
            
            };
            
            xhr.onreadystatechange = function() {
                var error,
                    over    = xhr.readyState === xhr.DONE,
                    OK      = 200;
                
                if (over)
                    if (xhr.status === OK) {
                        emitter.emit('end');
                    } else {
                        error = Error(xhr.responseText);
                        emitter.emit('error', error);
                    }
            };
            
            xhr.send(body);
            
            return emitter;
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
        };
        
        return load;
    }
})(Util, DOM);
