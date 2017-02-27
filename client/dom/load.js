'use strict';

const itype = require('itype/legacy');
const jonny = require('jonny');
const Emitify = require('emitify');
const exec = require('execon');
const Images = require('./images');
const Events = require('./events');

const {getExt} = require('../../common/util');

module.exports = load;
module.exports.getIdBySrc = getIdBySrc;
module.exports.ext = ext;

/**
 * Функция создаёт элемент и загружает файл с src.
 *
 * @param params = {
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
    const {
        src,
        id = getIdBySrc(params.src),
        func,
        name,
        async,
        inner,
        style,
        parent = document.body,
        className,
        attribute,
        notAppend,
    } = params;
    
    let element = document.getElementById(id);
    
    if (element) {
        exec(func);
        return element;
    }
    
    element = document.createElement(name);
    
    const funcError = () => {
        const msg = `file ${src} could not be loaded`;
        const error = new Error(msg);
        
        parent.removeChild(element);
        
        Images.show.error(msg);
        
        const callback = func && func.onerror || func.onload || func;
        
        exec(callback, error);
    };
    
    const funcLoad = () => {
        const callback = func && func.onload || func;
        
        Events.remove('error', element, funcError);
        
        exec(callback);
    };
    
    if (/^(script|link)$/.test(name))
        Events.addOnce('load', element, funcLoad)
              .addError(element, funcError);
    
    if (id)
        element.id = id;
    
    if (className)
        element.className = className;
    
    if (src) {
        if (name !== 'link') {
            element.src = src;
        } else {
            element.href = src;
            element.rel = 'stylesheet';
        }
    }
    
    if (attribute) {
        const type = itype(attribute);
        
        switch(type) {
        case 'string':
            element.setAttribute(attribute, '');
            break;
        
        case 'object':
            Object.keys(attribute).forEach((name) => {
                element.setAttribute(name, attribute[name]);
            });
            break;
        }
    }
    
    if (style)
        element.style.cssText = style;
    
    if (async && name === 'script' || async === undefined)
        element.async = true;
    
    if (!notAppend)
        parent.appendChild(element);
    
    if (inner)
        element.innerHTML = inner;
    
    return element;
}

/**
 * Function gets id by src
 * @param src
 *
 * Example: http://domain.com/1.js -> 1_js
 */
function getIdBySrc(src) {
    const isStr = itype.string(src);
    
    if (!isStr)
        return;
    
    if (~src.indexOf(':'))
        src += '-join';
    
    const num = src.lastIndexOf('/') + 1;
    const sub = src.substr(src, num);
    const id = src
        .replace(sub, '')
        .replace(/\./g, '-');
    
    return id;
}

/**
 * load file countent via ajax
 *
 * @param params
 */
module.exports.ajax = (params) => {
    const p = params;
    const isObject = itype.object(p.data);
    const isArray = itype.array(p.data);
    const isArrayBuf = itype(p.data) === 'arraybuffer';
    const type = p.type || p.method || 'GET';
    const headers = p.headers || {};
    const xhr = new XMLHttpRequest();
    
    xhr.open(type, p.url, true);
    
    Object.keys(headers).forEach((name) => {
        const value = headers[name];
        xhr.setRequestHeader(name, value);
    });
    
    if (p.responseType)
        xhr.responseType = p.responseType;
    
    let data;
    if (!isArrayBuf && isObject || isArray)
        data = jonny.stringify(p.data);
    else
        data = p.data;
    
    xhr.onreadystatechange = (event) => {
        const xhr = event.target;
        const OK  = 200;
        
        if (xhr.readyState !== xhr.DONE)
            return;
        
        Images.clearProgress();
        
        const TYPE_JSON = 'application/json';
        const type        = xhr.getResponseHeader('content-type');
        
        if (xhr.status !== OK)
            return exec(p.error, xhr);
        
        const notText = p.dataType !== 'text';
        const isContain = ~type.indexOf(TYPE_JSON);
        
        let data = xhr.response;
        if (type && isContain && notText)
            data = jonny.parse(xhr.response) || xhr.response;
            
        exec(p.success, data, xhr.statusText, xhr);
    };
    
    xhr.send(data);
};

module.exports.put = (url, body) => {
    const emitter = Emitify();
    const xhr = new XMLHttpRequest();
    
    url = encodeURI(url)
        .replace('#', '%23');
    
    xhr.open('put', url, true);
    
    xhr.upload.onprogress = (event) => {
        var percent, count;
        
        if (event.lengthComputable) {
            percent = (event.loaded / event.total) * 100;
            count   = Math.round(percent);
            
            emitter.emit('progress', count);
        }
    
    };
    
    xhr.onreadystatechange = () => {
        const over = xhr.readyState === xhr.DONE;
        const OK = 200;
        
        if (!over)
            return;
        
        if (xhr.status === OK)
            return emitter.emit('end');
        
        const error = Error(xhr.responseText);
        emitter.emit('error', error);
    };
    
    xhr.send(body);
    
    return emitter;
};

function ext(src, func) {
    switch (getExt(src)) {
    case '.js':
        return load.js(src, func);
    
    case '.css':
        return load.css(src, func);
    
    default:
        return load({
            src,
            func,
        });
    }
}

/**
 * create elements and load them to DOM-tree
 * one-by-one
 *
 * @param params
 * @param callback
 */
load.series = (params, callback) => {
    if (!params)
        return load;
    
    const funcs = params
        .map((url) => ext.bind(null, url))
        .concat(callback);
    
    exec.series(funcs);
    
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
load.parallel = (params, callback) => {
    if (!params)
        return load;
    
    const funcs = params.map((url) => {
        return ext.bind(null, url);
    });
    
    exec.parallel(funcs, callback);
    
    return load;
};

/**
 * Функция загружает js-файл
 *
 * @param src
 * @param func
 */
load.js = (src, func) => {
    const name = 'script';
    
    return load({
        name,
        src,
        func,
    });
},

load.css = (src, func) => {
    const name = 'link';
    const {head:parent} = document;
    
    return load({
        name,
        src,
        parent,
        func
    });
};

/**
 * Функция создаёт елемент style и записывает туда стили
 * @param params - структура параметров, заполняеться таким
 * образом: {src: ' ',func: '', id: '', element: '', inner: ''}
 * все параметры опциональны
 */
load.style = (params) => {
    const {
        id,
        src,
        name = 'style',
        func,
        inner,
        parent = document.head,
        element,
    } = params;
    
    return load({
        id,
        src,
        func,
        name,
        inner,
        parent,
        element,
    });
};
