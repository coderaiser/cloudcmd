'use strict';

/* global CloudCmd*/

const itype = require('itype/legacy');
const {promisify} = require('es6-promisify');

const {FS} = require('../../common/cloudfunc');

const Images = require('./images');
const load = require('./load');

const imgPosition = {
    top: true,
};

module.exports._replaceHash = replaceHash;
function replaceHash(url) {
    /*
     * if we send ajax request -
     * no need in hash so we escape #
     */
    return url.replace(/#/g, '%23');
}

module.exports.delete = promisify((url, data, callback) => {
    const isFunc = itype.function(data);
    
    if (!callback && isFunc) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method      : 'DELETE',
        url         : FS + url,
        data,
        callback,
        imgPosition : { top: !!data },
    });
});

module.exports.patch = promisify((url, data, callback) => {
    const isFunc = itype.function(data);
    
    if (!callback && isFunc) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method: 'PATCH',
        url: FS + url,
        data,
        callback,
        imgPosition,
    });
});

module.exports.write = promisify((url, data, callback) => {
    const isFunc = itype.function(data);
    
    if (!callback && isFunc) {
        callback = data;
        data = null;
    }
    
    sendRequest({
        method: 'PUT',
        url: FS + url,
        data,
        callback,
        imgPosition,
    });
});

module.exports.read = promisify((url, dataType, callback) => {
    const notLog = !url.includes('?');
    const isFunc = itype.function(dataType);
    
    if (!callback && isFunc) {
        callback = dataType;
        dataType = 'text';
    }
    
    sendRequest({
        method: 'GET',
        url: FS + url,
        callback,
        notLog,
        dataType,
    });
});

module.exports.cp = promisify((data, callback) => {
    sendRequest({
        method: 'PUT',
        url: '/cp',
        data,
        callback,
        imgPosition,
    });
});

module.exports.pack = promisify((data, callback) => {
    sendRequest({
        method: 'PUT',
        url: '/pack',
        data,
        callback,
    });
});

module.exports.extract = promisify((data, callback) => {
    sendRequest({
        method      : 'PUT',
        url         : '/extract',
        data,
        callback,
    });
});

module.exports.mv = promisify((data, callback) => {
    sendRequest({
        method      : 'PUT',
        url         : '/mv',
        data,
        callback,
        imgPosition,
    });
});

module.exports.Config = {
    read: promisify((callback) => {
        sendRequest({
            method: 'GET',
            url: '/config',
            callback,
            imgPosition,
            notLog: true,
        });
    }),
    
    write: promisify((data, callback) => {
        sendRequest({
            method: 'PATCH',
            url: '/config',
            data,
            callback,
            imgPosition,
        });
    }),
};

module.exports.Markdown = {
    read: promisify((url, callback) => {
        sendRequest({
            method: 'GET',
            url: '/markdown' + url,
            callback,
            imgPosition,
            notLog: true,
        });
    }),
    
    render: promisify((data, callback) => {
        sendRequest({
            method: 'PUT',
            url: '/markdown',
            data,
            callback,
            imgPosition,
            notLog: true,
        });
    }),
};

function sendRequest(params) {
    const p = params;
    const {prefixURL} = CloudCmd;
    
    p.url = prefixURL + p.url;
    p.url = encodeURI(p.url);
    
    p.url = replaceHash(p.url);
    
    load.ajax({
        method      : p.method,
        url         : p.url,
        data        : p.data,
        dataType    : p.dataType,
        error       : (jqXHR) => {
            const response = jqXHR.responseText;
            
            const {
                statusText,
                status,
            } = jqXHR;
            
            const text = status === 404 ? response : statusText;
            
            p.callback(Error(text));
        },
        success: (data) => {
            Images.hide();
            
            if (!p.notLog)
                CloudCmd.log(data);
            
            p.callback(null, data);
        },
    });
}

