var CloudCmd, Util, DOM, CloudFunc, Dropbox, cb, Client;

(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.DropBox    = DropBoxProto;
    
    function DropBoxProto(callback) {
        var DropBoxStore    = this;
        
        function init(callback){
            Util.exec.series([
                load,
                DropBoxStore.login,
                getUserData,
                Util.exec.ret(callback)
            ]);
            
        }
        
        cb = function (err, data){ console.log(err || data);};
        
        /**
         * function loads dropbox.js
         */
        function load(callback) {
            Util.time('dropbox load');
            
            var src = '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js';
            
            DOM.load.js(src, function() {
                Util.timeEnd('dropbox load');
                DOM.Images.hide();
                
                Util.exec(callback);
            });
            
        }
        
        function getUserData(callback) {
            Client.getUserInfo(function(pError, pData){
                var lHello = 'Hello ' + pData.name + ' :)!',
                    lMsg = pError ? pError : lHello;
                
                console.log(lMsg);
            });
            
            Util.exec(callback);
        }
        /**
         * function logins on dropbox
         * 
         * @param pData = {key, secret}
         */
        this.login               = function(callback) {
            DOM.Files.get('modules', function(error, modules){
                var url         = CloudCmd.HOST + '/html/auth/dropbox.html',
                    storage     = Util.findObjByNameInArr(modules, 'storage'),
                    dropbox     = Util.findObjByNameInArr(storage, 'DropBox'),
                    key         = dropbox.key;
                
                Client = new Dropbox.Client({
                    key: key
                });
                
                //Client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
                
                
                Client.authDriver(new Dropbox.AuthDriver.Popup({
                    receiverUrl : url,
                    noFragment  : true
                }));
                
                Client.authenticate(function(error, client) {
                    console.log(error);
                    Client = client;
                    Util.exec(callback);
                });
            
            });
          
        };
        
        this.read           = function(path, callback) {
            Client.stat(path, function(error, stat) {
                var msg, read;
                
                if (error)
                     msg        = error.responseText;
                else {
                    if (stat.isFile)
                        read    = readFile;
                    else
                        read    = readDir;
                    
                    read(path, callback);
                }
            });
        };
        
        this.save           = function(path, data, callback, query) {
            if (query === '?dir')
                mkDir(path, callback);
            else
                writeFile(path, data, callback);
        };
        
        this.delete         = function(path, callback) {
            Client.delete(path, callback);
        };
        
        this.cp             = function(from, to, callback) {
            Client.copy(from, to, callback);
        };
        
        this.mv             = function(from, to, callback) {
            Client.move(from, to, callback);
        };
        
        this.getToken       = function() {
            return Client.credentials().token;
        };
        
        /**
         * upload file to DropBox
         */
        this.uploadFile      = function(params, callback){
            var data    = params.data,
                name    = params.name;
            
            if (data) {
                if (!name)
                    name = new Date();
                
                DOM.Images.show.load();
                
                Client.writeFile(name, data, function(error, data){
                    DOM.Images.hide();
                    
                    console.log(error || data);
                    Util.exec(callback);
                });
            }
            
            return this;
        };
        
        function readDir(dirPath, callback) {
            var path = dirPath || '/';
            
            Client.readdir(path, function(error, names, obj, files) {
                var i, n, name, size, file, msg,
                    json = {
                        path    : path,
                        files   : []
                    };
                    
                if (path !== '/')
                    json.path += '/';
                
                if (error)
                    msg = error.responseText;
                
                n = files && files.length;
                
                for (i = 0; i < n; i++) {
                    file        = files[i];
                    name        = file.name;
                    
                    if (!file.isFile)
                        size    = 'dir';
                    else 
                        size    = CloudFunc.getShortSize(file.size);
                    
                    json.files.push({
                        name: name,
                        size: size,
                        mode: '.'
                    });
                }
                
                Util.exec(callback, msg, json);
            });
        }
        
        function mkDir(path, callback) {
            Client.mkdir(path, callback);
        }
        
        function readFile(name, callback) {
            Client.readFile(name, function(error, data) {
                var msg;
                
                if (error)
                    msg = error.responseText;
                
                callback(msg, data);
            });
        }
        
        function writeFile(name, data, callback) {
            Client.writeFile(name, data, function(error, data) {
                var msg;
                
                if (error)
                    msg = error.responseText;
                
                callback(msg, data);
            });
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM, CloudFunc);
