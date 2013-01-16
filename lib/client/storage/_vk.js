var CloudCommander, Util, DOM, VK;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var VKStorage      = {};
    
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(pCallBack){
        console.time('vk');
        
        var lUrl    = 'http://vkontakte.ru/js/api/openapi.js',
            lLocal  = CloudCmd.LIBDIRCLIENT + 'storage/vk/open.js',
            
            lOnload = function(){
                console.timeEnd('vk load');
                DOM.Images.hideLoad();
                
                Util.exec(pCallBack);
            };
        
        DOM.jsload(lUrl, {
            onload  : lOnload,
            error   : DOM.retJSLoad(lLocal, lOnload)
        });
        
    }
    
    function auth(){
        CloudCmd.getConfig(function(pConfig){
            VK.init({ apiId: pConfig.vk_id});
            VK.Auth.login(function(pResponse){
                console.log(pResponse);
            }, 131072); /* Доступ к документам пользователя */
        });
    }
    
    
    /**
     * Insert new file.
     *
     * @param {File} fileData {name, data} File object to read data from.
     * @param {Function} callback Function to call when the request is complete.
     */
    VKStorage.uploadFile = function(pParams, pCallBack) {
        var lData   = pParams.data,
            lName   = pParams.name;
    };
    
    
    VKStorage.init                = function(pCallBack){
           Util.loadOnLoad([
            Util.retExec(pCallBack),
            auth,
            load
        ]);
    };
    
    CloudCmd.VK    = VKStorage;
})(CloudCommander, Util, DOM);