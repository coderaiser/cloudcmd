/* load and store templates data */

/*global Promise */
/*global Util, DOM, CloudCmd */

(function(Util, DOM) {
    'use strict';
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.Files = new FilesProto(Util, DOM);
    
    function FilesProto(Util, DOM) {
        var Promises        = {},
            Storage         = DOM.Storage,
            Files           = this,
            FILES_JSON      = 'config|modules',
            FILES_HTML      = 'file|path|link|pathLink|media',
            FILES_HTML_ROOT = 'view/media-tmpl|config-tmpl|upload',
            funcs           = [],
            DIR_HTML        = '/tmpl/',
            DIR_HTML_FS     = DIR_HTML + 'fs/',
            DIR_JSON        = '/json/',
            timeout         = getTimeoutOnce(2000);
        
        this.get            = function(name, callback) {
            var type    = Util.type(name);
            
            Util.check(arguments, ['name', 'callback']);
            
            switch(type) {
            case 'string':
                getModule(name, callback);
                break;
            
            case 'array':
                funcs = name.map(function(name) {
                    return function(callback) {
                        Files.get(name, callback);
                    };
                });
                
                Util.exec.parallel(funcs, callback);
                break;
            }
            
            return Files;
        };
        
        function getModule(name, callback) {
            var path,
                
                regExpHTML  = new RegExp(FILES_HTML + '|' + FILES_HTML_ROOT),
                regExpJSON  = new RegExp(FILES_JSON),
                
                isHTML      = regExpHTML.test(name),
                isJSON      = regExpJSON.test(name);
            
            if (!isHTML && !isJSON) {
                showError(name);
            } else if (name === 'config') {
                getConfig(callback);
            } else {
                path = getPath(name, isHTML, isJSON);
                
                getSystemFile(path, callback);
            }
            
        }
        
        function getPath(name, isHTML, isJSON) {
            var path,
                regExp  = new RegExp(FILES_HTML_ROOT),
                isRoot  = regExp.test(name);
            
            if (isHTML) {
                if (isRoot)
                    path = DIR_HTML + name.replace('-tmpl', '');
                else
                    path = DIR_HTML_FS  + name;
                
                path += '.hbs';
            } else if (isJSON) {
                path = DIR_JSON  + name + '.json';
            }
            
            return path;
        }
        
        function showError(name) {
            var str     = 'Wrong file name: ' + name,
                error   = new Error(str);
            
            throw(error);
        }
        
        function getSystemFile(url, callback) {
            var prefix = CloudCmd.PREFIX;
            
            if (!Promises[url])
                Promises[url] = new Promise(function(resolve, reject) {
                    DOM.load.ajax({
                        url     : prefix + url,
                        success : resolve,
                        error   : reject
                    });
                });
            
            Promises[url].then(function(data) {
                callback(null, data);
            }, function(error) {
                Promises[url] = null;
                callback(error);
            });
        }
        
        function getConfig(callback) {
            var is,
                RESTful = DOM.RESTful;
            
            if (!Promises.config)
                Promises.config = new Promise(function(resolve, reject) {
                    is = true;
                    RESTful.Config.read(function(error, data) {
                        if (error)
                            reject(error);
                        else
                            resolve(data);
                    });
                });
            
            Promises.config.then(function(data) {
                is = false;
                Storage.setAllowed(data.localStorage);
                
                callback(null, data);
                
                timeout(function() {
                    if (!is)
                        Promises.config = null;
                });
            }, function() {
                if (!is)
                    Promises.config = null;
            });
        }
        
        function getTimeoutOnce(time) {
            var is,
                fn = function(callback) {
                    if (!is) {
                        is = true;
                        
                        setTimeout(function() {
                            is = false;
                            callback();
                        }, time);
                    }
                };
            
            return fn;
        }
    }
})(Util, DOM);
