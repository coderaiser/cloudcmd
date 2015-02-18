var CloudCmd, Util, DOM, VK;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    var VKStorage      = {};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(pCallBack) {
        console.time('vk');
        
        var lUrl    = 'http://vkontakte.ru/js/api/openapi.js',
            lLocal  = CloudCmd.LIBDIRCLIENT + 'storage/vk/open.js',
            
            lOnload = function() {
                console.timeEnd('vk load');
                DOM.Images.hide();
                
                Util.exec(pCallBack);
            };
        
        DOM.load.js(lUrl, {
            onload  : lOnload,
            error   : DOM.retJSLoad(lLocal, lOnload)
        });
        
    }
    
    function auth(callback) {
        DOM.Files.get('config', function(error, config) {
            var lDOCUMENTS_ACCESS = 131072;
            
            VK.init({ apiId: config.vk_id});
            
            VK.Auth.login(function() {
                var lNAME = 1281;
                VK.Api.call('getVariable', {key: lNAME}, function(r) {
                    var lName = r.response;
                    
                    if (lName)
                        console.log ('Hello, ' + lName + ':)');
                });
                
                Util.exec(callback);
                
            }, lDOCUMENTS_ACCESS); /* Доступ к документам пользователя */
        });
    }
    
    
    /**
     * Insert new file.
     *
     * @param {File} fileData {name, data} File object to read data from.
     */
    VKStorage.uploadFile = function(params) {
        /* http://vk.com/developers.php?oid=-1&p=docs.getUploadServer */
        VK.Api.call('docs.getUploadServer', {}, function(result) {
            var url     = result.response.upload_url,
                data    = params.data,
                name    = params.name;
            
            DOM.load.ajax({
                type    : 'POST',
                url     : url,
                data    : {
                    file: data,
                    name: name
                },
                dataType: 'application/x-www-form-urlencoded',
                success : function(data) {
                    console.log(data);
                    VK.Api.call('docs.save', {}, console.log);
                },
                
                error   : console.log
              });
        });
    };
    
    VKStorage.init                = function(callback) {
       Util.exec.series([
            load,
            auth,
            Util.exec.ret(callback)
        ]);
    };
    
    CloudCmd.VK    = VKStorage;
})(CloudCmd, Util, DOM);
