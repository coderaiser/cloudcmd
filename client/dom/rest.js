'use strict';

/* global CloudCmd, DOM */

const itype = require('itype/legacy');

const {FS} = require('../../common/cloudfunc');

module.exports = new RESTful();

const Images = require('./images');
const load = require('./load');

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
            imgPosition : { top: !!data }
        });
    };
    
    this.patch = (url, data, callback) => {
        const isFunc = itype.function(data);
        
        if (!callback && isFunc) {
            callback = data;
            data = null;
        }
        
        const imgPosition = {
            top: true
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
            callback    = data;
            data        = null;
        }
        
        sendRequest({
            method: 'PUT',
            url: FS + url,
            data,
            callback,
            imgPosition : { top: true }
        });
    };
    
    this.read = (url, dataType, callback) => {
        const isQuery = /\?/.test(url);
        const isBeautify = /\?beautify$/.test(url);
        const isMinify = /\?minify$/.test(url);
        const notLog = !isQuery || isBeautify || isMinify;
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
            imgPosition : { top: true }
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
            data        : data,
            callback    : callback
        });
    };
    
    this.mv = function(data, callback) {
        sendRequest({
            method      : 'PUT',
            url         : '/mv',
            data        : data,
            callback    : callback,
            imgPosition : { top: true }
        });
    };
    
    this.Config = {
        read:   function(callback) {
            sendRequest({
                method      : 'GET',
                url         : '/config',
                callback    : callback,
                imgPosition : { top: true },
                notLog      : true
            });
        },
        
        write:  function(data, callback) {
            sendRequest({
                method      : 'PATCH',
                url         : '/config',
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        }
    };
    
    this.Markdown   = {
        read    : function(url, callback) {
            sendRequest({
                method      : 'GET',
                url         : '/markdown' + url,
                callback    : callback,
                imgPosition : { top: true },
                notLog      : true
            });
        },
        
        render  : function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/markdown',
                data        : data,
                callback    : callback,
                imgPosition : { top: true },
                notLog      : true
            });
        }
    };
    
    function sendRequest(params) {
        const p = params;
        const prefixUrl = CloudCmd.PREFIX_URL;
        
        p.url = prefixUrl + p.url;
        p.url = encodeURI(p.url);
        
        /*
         * if we send ajax request -
         * no need in hash so we escape #
         */
        p.url = p.url.replace('#', '%23');
        
        load.ajax({
            method      : p.method,
            url         : p.url,
            data        : p.data,
            dataType    : p.dataType,
            error       : (jqXHR) => {
                const response = jqXHR.responseText;
                const statusText = jqXHR.statusText;
                const status = jqXHR.status;
                const text = status === 404 ? response : statusText;
                
                Images.show.error(text);
                setTimeout(() => {
                    DOM.Dialog.alert(CloudCmd.TITLE, text);
                }, 100);
                
                p.callback(Error(text));
            },
            success: (data) => {
                Images.hide();
                
                if (!p.notLog)
                    CloudCmd.log(data);
                
                p.callback(null, data);
            }
        });
    }
}
