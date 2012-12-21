var CloudCommander, Util, DOM, CloudFunc, Dropbox, cb, Client;
/* module for work with github */

(function(){
    "use strict";
    
    var CloudCmd                        = CloudCommander,
        //Client,
        DropBoxStore                    = {};
    
    /* temporary callback function for work with github */
    cb = function (err, data){ console.log(err || data);};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads dropbox.js
     */
    function load(pCallBack){
        console.time('dropbox load');
        
        //var lSrc        = '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.7.1/dropbox.min.js',
        var lSrc        = CloudCmd.LIBDIRCLIENT + 'storage/dropbox/lib/dropbox.js',
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
        var lName,
            lShowUserInfo =  function(pError, pData){
                if(!pError){
                    lName  = pData.name;
                    console.log('Hello ' + lName + ' :)!');
                }
            };
            
        Client.getUserInfo(lShowUserInfo);
        
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
            Client.authDriver(new Dropbox.Drivers.Redirect({rememberUser: true}));
            
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
                console.log(pError || pData);
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
})();
