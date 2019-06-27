'use strict';

const itype = require('itype/legacy');
const jonny = require('jonny/legacy');
const Emitify = require('emitify/legacy');
const exec = require('execon');
const Images = require('./images');

module.exports.getIdBySrc = getIdBySrc;

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
    const {
        headers = {},
    } = p;
    const xhr = new XMLHttpRequest();
    
    xhr.open(type, p.url, true);
    
    for (const name of Object.keys(headers)) {
        const value = headers[name];
        xhr.setRequestHeader(name, value);
    }
    
    if (p.responseType)
        xhr.responseType = p.responseType;
    
    let data;
    
    if (!isArrayBuf && isObject || isArray)
        data = jonny.stringify(p.data);
    else
        data = p.data;
    
    xhr.onreadystatechange = (event) => {
        const xhr = event.target;
        const OK = 200;
        
        if (xhr.readyState !== xhr.DONE)
            return;
        
        Images.clearProgress();
        
        const TYPE_JSON = 'application/json';
        const type = xhr.getResponseHeader('content-type');
        
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
        if (!event.lengthComputable)
            return;
        
        const percent = event.loaded / event.total * 100;
        const count = Math.round(percent);
        
        emitter.emit('progress', count);
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

