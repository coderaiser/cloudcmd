var Util, DOM, CloudFunc, CloudCmd;

(function(Util, DOM, CloudFunc) {
    'use strict';
    
    var RESTful     = Util.extendProto(RESTfulProto),
        DOMProto    = Object.getPrototypeOf(DOM);
    
    Util.extend(DOMProto, {
        RESTful: RESTful
    });
    
    function RESTfulProto() {
        var Images = DOM.Images;
        
        this.delete = function(url, data, callback) {
            var isFunc = Util.type.function(data);
            
            if (!callback && isFunc) {
                callback = data;
                data = null;
            }
            
            sendRequest({
                method      : 'DELETE',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: !!data }
            });
        };
        
        this.patch  = function(url, data, callback) {
            var isFunc = Util.type.function(data);
            
            if (!callback && isFunc) {
                callback = data;
                data = null;
            }
            
            sendRequest({
                method      : 'PATCH',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.write   = function(url, data, callback) {
            var isFunc      = Util.type.function(data);
            
            if (!callback && isFunc) {
                callback    = data;
                data        = null;
            }
            
            sendRequest({
                method      : 'PUT',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.read   = function(url, dataType, callback) {
            var isQuery     = /\?/.test(url),
                isBeautify  = /\?beautify$/.test(url),
                isMinify    = /\?minify$/.test(url),
                notLog      = !isQuery || isBeautify || isMinify,
                isFunc      = Util.type.function(dataType);
            
            if (!callback && isFunc) {
                callback    = dataType;
                dataType    = 'text';
            }
            
            sendRequest({
                method      : 'GET',
                url         : CloudFunc.FS + url,
                callback    : callback,
                notLog      : notLog,
                dataType    : dataType
            });
        };
        
         this.cp     = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/cp',
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.pack   = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/pack',
                data        : data,
                callback    : callback
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
            var p           = params,
                prefixUrl   = CloudCmd.PREFIX_URL;
            
            p.url   = prefixUrl + p.url;
            p.url   = encodeURI(p.url);
            
            /*
             * if we send ajax request -
             * no need in hash so we escape #
             */
            p.url   = p.url.replace('#', '%23');
            
            DOM.load.ajax({
                method      : p.method,
                url         : p.url,
                data        : p.data,
                dataType    : p.dataType,
                error       : function(jqXHR) {
                    var response       = jqXHR.responseText,
                        statusText     = jqXHR.statusText,
                        status         = jqXHR.status,
                        text           = status === 404 ? response : statusText;
                    
                    Images.show.error(text);
                    setTimeout(function() {
                        DOM.Dialog.alert(CloudCmd.TITLE, text);
                    }, 100);
                    
                    p.callback(Error(text));
                },
                success     : function(data) {
                    Images.hide();
                    
                    if (!p.notLog)
                        CloudCmd.log(data);
                    
                    p.callback(null, data);
                }
            });
        }
    }
})(Util, DOM, CloudFunc);
