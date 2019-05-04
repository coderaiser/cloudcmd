'use strict';

/* global CloudCmd, DOM */

const itype = require('itype/legacy');

const {FS} = require('../../common/cloudfunc');
const {encode} = require('../../common/entity');

module.exports = new RESTful();

const Images = require('./images');
const load = require('./load');

module.exports._replaceHash = replaceHash;
function replaceHash(url) {
    /*
     * if we send ajax request -
     * no need in hash so we escape #
     */
    return url.replace(/#/g, '%23');
}

function RESTful() {
    this.delete = (url, data, callback) => {
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
    };
    
    this.patch = (url, data, callback) => {
        const isFunc = itype.function(data);
        
        if (!callback && isFunc) {
            callback = data;
            data = null;
        }
        
        const imgPosition = {
            top: true,
        };
        
        sendRequest({
            method: 'PATCH',
            url: FS + url,
            data,
            callback,
            imgPosition,
        });
    };
    
    this.write = (url, data, callback) => {
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
            imgPosition : { top: true },
        });
    };
    
    this.read = (url, dataType, callback) => {
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
    };
    
    this.cp = (data, callback) => {
        sendRequest({
            method: 'PUT',
            url: '/cp',
            data,
            callback,
            imgPosition : { top: true },
        });
    };
    
    this.pack = (data, callback) => {
        sendRequest({
            method      : 'PUT',
            url         : '/pack',
            data,
            callback,
        });
    };
    
    this.extract = function(data, callback) {
        sendRequest({
            method      : 'PUT',
            url         : '/extract',
            data,
            callback,
        });
    };
    
    this.mv = function(data, callback) {
        sendRequest({
            method      : 'PUT',
            url         : '/mv',
            data,
            callback,
            imgPosition : { top: true },
        });
    };
    
    this.Config = {
        read(callback) {
            sendRequest({
                method      : 'GET',
                url         : '/config',
                callback,
                imgPosition : { top: true },
                notLog      : true,
            });
        },
        
        write(data, callback) {
            sendRequest({
                method      : 'PATCH',
                url         : '/config',
                data,
                callback,
                imgPosition : { top: true },
            });
        },
    };
    
    this.Markdown = {
        read(url, callback) {
            sendRequest({
                method      : 'GET',
                url         : '/markdown' + url,
                callback,
                imgPosition : { top: true },
                notLog      : true,
            });
        },
        
        render(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/markdown',
                data,
                callback,
                imgPosition : { top: true },
                notLog      : true,
            });
        },
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
                const encoded = encode(text);
                
                Images.show.error(encoded);
                
                setTimeout(() => {
                    DOM.Dialog.alert(encoded);
                }, 100);
                
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
}
