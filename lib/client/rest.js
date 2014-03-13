var Util, DOM, CloudCmd;

(function(Util, DOM) {
    'use strict';
    
    var RESTful     = Util.extendProto(RESTfulProto),
        DOMProto    = Object.getPrototypeOf(DOM);
    
    Util.extend(DOMProto, {
        RESTful: RESTful
    });

    function RESTfulProto() {
        var Images = DOM.Images;
        
        this.delete = function(url, data, callback) {
            sendRequest({
                method      : 'DELETE',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: !!data }
            });
        };
        
        this.write   = function(url, data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : CloudFunc.FS + url,
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.read   = function(url, callback) {
            sendRequest({
                method      : 'GET',
                url         : CloudFunc.FS + url,
                callback    : callback
            });
        };
        
         this.cp     = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/cp',
                data        : data,
                callback    : callback
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
        
        this.mv     = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/mv',
                data        : data,
                callback    : callback
            });
        };
        
        this.config    = function(data, callback) {
            sendRequest({
                method      : 'PUT',
                url         : '/config',
                data        : data,
                callback    : callback,
                imgPosition : { top: true }
            });
        };
        
        this.Markdown   = {
            read    : function(url, callback) {
                sendRequest({
                    method      : 'GET',
                    url         : '/markdown' + url,
                    callback    : callback,
                    imgPosition : { top: true },
                    doNotLog    : true
                });
            },
            
            render  : function(data, callback) {
                sendRequest({
                    method      : 'PUT',
                    url         : '/markdown',
                    data        : data,
                    callback    : callback,
                    imgPosition : { top: true },
                    doNotLog    : true
                });
            }
        };
        
       function sendRequest(params) {
            var p = params;
                
            Images.showLoad(p.imgPosition);
            
            CloudCmd.getConfig(function(config) {
                var data,
                    isString        = Util.isString(p.data),
                    isArrayBuffer   = Util.isArrayBuffer(p.data);
                
                if (Util.isString(p.url))
                    p.url = decodeURI(p.url);
                
                if (p.data && !isString  && !isArrayBuffer)
                    data = Util.stringifyJSON(p.data);
                else
                    data = p.data;
                
                p.url        = config && config.apiURL + p.url;
                
                DOM.ajax({
                    method  : p.method,
                    url     : p.url,
                    data    : data,
                    error   : Images.showError,
                    success : function(data) {
                        Images.hideLoad();
                        
                        if (!p.doNotLog)
                            Util.log(data);
                        
                        Util.exec(p.callback, data);
                    }
                });
            });
        }
    }
})(Util, DOM);
