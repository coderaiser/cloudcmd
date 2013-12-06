var CloudCmd, Util, DOM, Dropbox, cb, Client;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.DropBox    = DropBoxProto;
    
    function DropBoxProto(pCallBack) {
        var DropBoxStore    = this;
        
        function init(pCallBack){
            Util.loadOnLoad([
                Util.retExec(pCallBack),
                getUserData,
                DropBoxStore.login,
                load
            ]);
            
        }
        
        cb = function (err, data){ Util.log(err || data);};
        
        /**
         * function loads dropbox.js
         */
        function load(pCallBack){
            console.time('dropbox load');
            
            var lSrc        = '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js',
                lLocal      = '/node_modules/dropbox/lib/dropbox.js',
                lOnload     = function(){
                    console.timeEnd('dropbox load');
                    DOM.Images.hideLoad();
                    
                    Util.exec(pCallBack);
                };
            
            DOM.jsload(lSrc, {
                onload  : lOnload,
                error   : DOM.retJSLoad(lLocal, lOnload)
            });
            
        }
        
        function getUserData(pCallBack){
            Client.getUserInfo(function(pError, pData){
                var lHello = 'Hello ' + pData.name + ' :)!',
                    lMsg = pError ? pError : lHello;
                
                Util.log(lMsg);
            });
            
            Util.exec(pCallBack);
        }
        /**
         * function logins on dropbox
         * 
         * @param pData = {key, secret}
         */
        this.login               = function(pCallBack){
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
                
                Client.authenticate(function(pError, pClient) {
                    Util.log(pError);
                    Client = pClient;
                    Util.exec(pCallBack);
                });
            
            });
          
        };
        
        
        this.readDir        = function(dirPath, callback) {
            var path = dirPath || '/';
            
            Client.readdir(path, function(error, names, obj, files) {
                var i, n, name, size, file, fullSize, msg,
                    json = {
                        path    : path,
                        files   : []
                    };
                
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
                        size: size
                    });
                }
                
                Util.exec(callback, msg, json);
            });
        };
        
        this.readFile       = function(name, callback) {
            Client.readFile(name, function(error, data) {
                var msg;
                
                if (error)
                    msg = error.responseText;
                
                callback(msg, data);
            });
        };
        
        this.read           = function(path, callback) {
            Client.stat(path, function(error, stat) {
                var msg, read;
                
                if (error)
                     msg        = error.responseText;
                else {
                    if (stat.isFile)
                        read    = DropBoxStore.readFile;
                    else
                        read    = DropBoxStore.readDir;
                    
                    read(path, callback);
                }
            });
        };
        
        this.writeFile       = function(name, data, callback) {
            Client.writeFile(name, data, function(error, data) {
                var msg;
                
                if (error)
                    msg = error.responseText;
                
                callback(msg, data);
            });
        };
        
        this.mkDir          = function(path, callback) {
            Client.mkdir(path, callback);
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
                    DOM.Images.hideLoad();
                    Util.log(pError || pData);
                    Util.exec(pCallBack);
                });
            }
            
            return lContent;
        };
        
        init(pCallBack);
    }
    
})(CloudCmd, Util, DOM);
