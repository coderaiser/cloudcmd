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
            var isFunc      = Util.type.function(data);
            
            if (!callback && isFunc) {
                callback    = data;
                data        = null;
            }
            
            sendRequest({
                method      : 'DELETE',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: !!data }
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
        
        this.zip    = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/zip',
                data        : data,
                callback    : callback
            });
        };
        
        this.unzip  = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/unzip',
                data        : data,
                callback    : callback
            });
        };
        
        this.mv     = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/mv',
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.Config    = {
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
                    method      : 'PUT',
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
            var prefix          = CloudCmd.PREFIX,
                p               = params,
                apiURL          = prefix + CloudFunc.apiURL;
            
            p.url   = apiURL + p.url;
            p.url   = encodeURI(p.url);
            
            /*
             * if we send ajax request -
             * no need in hash so we escape #
             */
            p.url   = Util.replaceStr(p.url, '#', '%23');
            
            DOM.load.ajax({
                method      : p.method,
                url         : p.url,
                data        : p.data,
                dataType    : p.dataType,
                error       : Images.showError,
                success     : function(data) {
                    Images.hide();
                    
                    if (!p.notLog)
                        Util.log(data);
                    
                    Util.exec(p.callback, data);
                }
            });
        }
    }
})(Util, DOM, CloudFunc);
