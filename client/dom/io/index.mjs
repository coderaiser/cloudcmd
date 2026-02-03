import {FS} from '#common/cloudfunc';
import {sendRequest as _sendRequest} from './send-request.mjs';

const imgPosition = {
    top: true,
};

export const remove = async (url, data) => {
    return await _sendRequest({
        method: 'DELETE',
        url: FS + url,
        data,
        imgPosition: {
            top: Boolean(data),
        },
    });
};

export const patch = async (url, data) => {
    return await _sendRequest({
        method: 'PATCH',
        url: FS + url,
        data,
        imgPosition,
    });
};

export const write = async (url, data) => {
    return await _sendRequest({
        method: 'PUT',
        url: FS + url,
        data,
        imgPosition,
    });
};

export const createDirectory = async (url, overrides = {}) => {
    const {
        sendRequest = _sendRequest,
    } = overrides;
    
    return await sendRequest({
        method: 'PUT',
        url: `${FS}${url}?dir`,
        imgPosition,
    });
};

export const read = async (url, dataType = 'text') => {
    const notLog = !url.includes('?');
    
    return await _sendRequest({
        method: 'GET',
        url: FS + url,
        notLog,
        dataType,
    });
};

export const copy = async (from, to, names) => {
    return await _sendRequest({
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

export const pack = async (data) => {
    return await _sendRequest({
        method: 'PUT',
        url: '/pack',
        data,
    });
};

export const extract = async (data) => {
    return await _sendRequest({
        method: 'PUT',
        url: '/extract',
        data,
    });
};

export const move = async (from, to, names) => {
    return await _sendRequest({
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

export const rename = async (from, to) => {
    return await _sendRequest({
        method: 'PUT',
        url: '/rename',
        data: {
            from,
            to,
        },
        imgPosition,
    });
};

export const Config = {
    read: async () => {
        return await _sendRequest({
            method: 'GET',
            url: '/config',
            imgPosition,
            notLog: true,
        });
    },
    
    write: async (data) => {
        return await _sendRequest({
            method: 'PATCH',
            url: '/config',
            data,
            imgPosition,
        });
    },
};

export const Markdown = {
    read: async (url) => {
        return await _sendRequest({
            method: 'GET',
            url: `/markdown${url}`,
            imgPosition,
            notLog: true,
        });
    },
    
    render: async (data) => {
        return await _sendRequest({
            method: 'PUT',
            url: '/markdown',
            data,
            imgPosition,
            notLog: true,
        });
    },
};
