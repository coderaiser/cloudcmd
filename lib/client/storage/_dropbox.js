var CloudCommander, Util, DOM, CloudFunc, Dropbox, cb, Client;
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
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
        
        var lSrc        = '//cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.7.1/dropbox.min.js',
            lLocal      = CloudFunc.LIBDIRCLIENT + 'storage/dropbox/lib/dropbox.min.js',
            lOnload    = function(){               
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
        cloudcmd.getConfig(function(pConfig){
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
    DropBoxStore.uploadFile      = function(pContent, pFileName){
        if(pContent){
            DOM.Images.showLoad();
            if(!pFileName)
                pFileName = Util.getDate();
            
            Client.writeFile(pFileName, pContent, function(pError, pData){
                DOM.Images.hideLoad();
                console.log(pError || pData);
            });
        }
        
        return pContent;
    };
    
    DropBoxStore.init            = function(pCallBack){
        Util.loadOnLoad([
            Util.retExec(pCallBack),
            getUserData,
            DropBoxStore.login,
            load
        ]);
        
        cloudcmd.DropBox.init = null;
    };
    
    cloudcmd.DropBox                 = DropBoxStore;
})();
