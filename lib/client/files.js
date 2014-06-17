/* load and store templates data */

var Util, DOM;

(function(Util, DOM) {
    
    var DOMProto    = Object.getPrototypeOf(DOM);
    
    DOMProto.Files = new FilesProto(Util, DOM);
    
    function FilesProto(Util, DOM) {
        var Files           = this,
            funcs           = [],
            Data            = {},
            DIR_HTML        = '/html/',
            DIR_HTML_FS     = DIR_HTML + 'fs/',
            DIR_JSON        = '/json/';
        
        this.get            = function(name, callback) {
            var type    = Util.getType(name);
            
            Util.checkArgs(arguments, ['name', 'callback']);
            
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
        
        this.set            = function(name, data, callback) {
            Util.checkArgs(arguments, [name, data]);
            
            Data[name] = data;
            callback(null);
            
            return Files;
        };
        
        function getModule(name, callback) {
            var path,
                json        = 'config|modules|ext',
                html        = 'file|path|link|pathLink',
                
                regExpHTML  = new RegExp(html),
                regExpJSON  = new RegExp(json),
                
                isHTML      = name.match(regExpHTML),
                isJSON      = name.match(regExpJSON);
            
            if (isHTML) {
                path = DIR_HTML_FS + name + '.html',
                getSystemFile(Data[name], path , callback);
            } else if (isJSON) {
                if (name === 'config') {
                    getConfig(callback);
                } else {
                    path = DIR_JSON  + name + '.json';
                    getSystemFile(Data[name], path, callback);
                }
            } else {
                throw(new Error('Wrong file name: ' + name));
            }
        }
        
        function getSystemFile(global, url, callback) {
            var success = Util.exec.with(callback, null);
            
            Util.exec.if(global, success, function() {
                DOM.load.ajax({
                    url     : url,
                    success : function(local) {
                        global = local;
                        success(local);
                    },
                    error   : function(error) {
                        callback(error);
                    }
                });
            });
        }
        
        function getConfig(callback) {
            var func    = Util.exec.with(callback, null);
            
            Util.exec.if(Data.config, func, function(callback) {
                var RESTful = DOM.RESTful;
                
                RESTful.Config.read(function(config) {
                    Data.config = config;
                    callback(config);
                });
            });
        }
    }
})(Util, DOM);
