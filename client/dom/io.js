'use strict';

/* global CloudCmd */

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

module.exports.delete = async (url, data) => {
    return await sendRequest({
        method      : 'DELETE',
        url         : FS + url,
        data,
        imgPosition : {
            top: Boolean(data),
        },
    });
};

module.exports.patch = async (url, data) => {
    return await sendRequest({
        method: 'PATCH',
        url: FS + url,
        data,
        imgPosition,
    });
};

module.exports.write = async (url, data) => {
    return await sendRequest({
        method: 'PUT',
        url: FS + url,
        data,
        imgPosition,
    });
};

module.exports.read = async (url, dataType = 'text') => {
    const notLog = !url.includes('?');
    
    return await sendRequest({
        method: 'GET',
        url: FS + url,
        notLog,
        dataType,
    });
};

module.exports.cp = async (data) => {
    return await sendRequest({
        method: 'PUT',
        url: '/cp',
        data,
        imgPosition,
    });
};

module.exports.pack = async (data) => {
    return await sendRequest({
        method: 'PUT',
        url: '/pack',
        data,
    });
};

module.exports.extract = async (data) => {
    return await sendRequest({
        method: 'PUT',
        url: '/extract',
        data,
    });
};

module.exports.mv = async (data) => {
    return await sendRequest({
        method: 'PUT',
        url: '/mv',
        data,
        imgPosition,
    });
};

module.exports.rename = async (from, to) => {
    return await sendRequest({
        method: 'PUT',
        url: '/rename',
        data: {
            from,
            to,
        },
        imgPosition,
    });
};

module.exports.Config = {
    read: async () => {
        return await sendRequest({
            method: 'GET',
            url: '/config',
            imgPosition,
            notLog: true,
        });
    },
    
    write: async (data) => {
        return await sendRequest({
            method: 'PATCH',
            url: '/config',
            data,
            imgPosition,
        });
    },
};

module.exports.Markdown = {
    read: async (url) => {
        return await sendRequest({
            method: 'GET',
            url: '/markdown' + url,
            imgPosition,
            notLog: true,
        });
    },
    
    render: async (data) => {
        return await sendRequest({
            method: 'PUT',
            url: '/markdown',
            data,
            imgPosition,
            notLog: true,
        });
    },
};

const sendRequest = promisify((params, callback) => {
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
            
            callback(Error(text));
        },
        success: (data) => {
            Images.hide();
            
            if (!p.notLog)
                CloudCmd.log(data);
            
            callback(null, data);
        },
    });
});

