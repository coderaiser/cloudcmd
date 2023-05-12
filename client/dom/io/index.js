'use strict';

const {FS} = require('../../../common/cloudfunc');
const sendRequest = require('./send-request');

const imgPosition = {
    top: true,
};

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

module.exports.createDirectory = async (url) => {
    return await sendRequest({
        method: 'PUT',
        url: `${FS}${url}?dir`,
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

module.exports.copy = async (from, to, names) => {
    return await sendRequest({
        method: 'PUT',
        url: '/copy',
        data: {
            from,
            to,
            names,
        },
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

module.exports.move = async (from, to, names) => {
    return await sendRequest({
        method: 'PUT',
        url: '/move',
        data: {
            from,
            to,
            names,
        },
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
            url: `/markdown${url}`,
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

