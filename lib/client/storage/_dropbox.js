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
        
        cb = function (err, data){ Util.log(err || data);};
        
        /**
         * function loads dropbox.js
         */
        function load(callback) {
            console.time('dropbox load');
            
            var lSrc        = '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js',
                lLocal      = '/node_modules/dropbox/lib/dropbox.js',
                lOnload     = function(){
                    console.timeEnd('dropbox load');
                    DOM.Images.hide();
                    
                    Util.exec(callback);
                };
            
            DOM.jsload(lSrc, {
                onload  : lOnload,
                error   : DOM.retJSLoad(lLocal, lOnload)
            });
            
        }
        
        function getUserData(callback) {
            Client.getUserInfo(function(pError, pData){
                var lHello = 'Hello ' + pData.name + ' :)!',
                    lMsg = pError ? pError : lHello;
                
                Util.log(lMsg);
            });
            
            Util.exec(callback);
        }
        /**
         * function logins on dropbox
         * 
         * @param pData = {key, secret}
         */
        this.login               = function(callback) {
            CloudCmd.getModules(function(pModules){
                var lStorage    = Util.findObjByNameInArr(pModules, 'storage'),
                    lDropBox    = Util.findObjByNameInArr(lStorage, 'DropBox'),
                    lDropBoxKey = lDropBox && lDropBox.key;
                
                Client = new Dropbox.Client({
                    key: lDropBoxKey
                });
                
                //Client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
                
                var lURL = CloudCmd.HOST + '/html/auth/dropbox.html';
                Client.authDriver(new Dropbox.AuthDriver.Popup({
                    receiverUrl: lURL, noFragment: true
                }));
                
                Client.authenticate(function(error, client) {
                    Util.log(error);
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
        this.uploadFile      = function(pParams, pCallBack){
            var lContent    = pParams.data,
                lName       = pParams.name;
            
            if(lContent){
                DOM.Images.showLoad();
                if(!lName)
                    lName = Util.getDate();
                
                Client.writeFile(lName, lContent, function(pError, pData){
                    DOM.Images.hide();
                    Util.log(pError || pData);
                    Util.exec(pCallBack);
                });
            }
            
            return lContent;
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
