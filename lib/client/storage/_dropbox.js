var CloudCommander, Util, DOM, Dropbox, cb, Client;
/* module for work with github */

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var DropBoxStore                    = {};
    
    /* temporary callback function for work with github */
    cb = function (err, data){ Util.log(err || data);};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads dropbox.js
     */
    function load(pCallBack){
        console.time('dropbox load');
        
        var lSrc        = 'http://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.8.1/dropbox.min.js',
            lLocal      = CloudCmd.LIBDIRCLIENT + 'storage/dropbox/lib/dropbox.min.js',
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
    DropBoxStore.login               = function(pCallBack){
        CloudCmd.getConfig(function(pConfig){
            Client = new Dropbox.Client({
                key: pConfig.dropbox_encoded_key
            });
            
            //Client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
            
            var lURL = CloudCmd.HOST + '/html/auth/dropbox.html';
            Client.authDriver(new Dropbox.Drivers.Popup({
                receiverUrl: lURL, noFragment: true
            }));
            
            Client.authenticate(function(pError, pClient) {
                Util.log(pError);
                Client = pClient;
                Util.exec(pCallBack);
            });
        
        });
      
    };
    /**
     * upload file to DropBox
     */
    DropBoxStore.uploadFile      = function(pParams, pCallBack){
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
    
    DropBoxStore.init            = function(pCallBack){
        Util.loadOnLoad([
            Util.retExec(pCallBack),
            getUserData,
            DropBoxStore.login,
            load
        ]);
        
        CloudCmd.DropBox.init = null;
    };
    
    CloudCmd.DropBox                 = DropBoxStore;
})(CloudCommander, Util, DOM);
