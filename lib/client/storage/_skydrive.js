//http://isdk.dev.live.com/ISDK.aspx?category=scenarioGroup_skyDrive&index=0
var CloudCmd, Util, DOM, WL;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var SkyDrive      = {};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(callback){
        console.time('SkyDrive');
        var lUrl    = '//js.live.net/v5.0/wl.js';
        
        DOM.load.js(lUrl, function(){
            console.timeEnd('SkyDrive load');
            DOM.Images.hide();
            
            Util.exec(callback);
        });
        
    }
    
    function auth() {
       DOM.Files.get('modules', function(error, modules){
            var lStorage    = Util.findObjByNameInArr(modules, 'storage'),
                lSkyDrive    = Util.findObjByNameInArr(lStorage, 'SkyDrive'),
                lSkyDriveKey = lSkyDrive && lSkyDrive.id;
            
            WL.init({
                client_id: lSkyDriveKey,
                redirect_uri: CloudCmd.HOST,
            });
            
            WL.login({
                scope: ['wl.skydrive wl.signin']
            }).then(
                function(response) {
                    console.log(response);
                },
                function() {
                    console.log('Failed to authenticate.');
                });
            
            WL.Event.subscribe('auth.login', onLogin);
        });
    }
    
   
    function onLogin() {
        var strGreeting = '';
        WL.api({
                path: 'me',
                method: 'GET'
            },
            
            function (response) {
                if (!response.error) {
                    strGreeting = 'Hi, ' + response.first_name + '!';
                    console.log(strGreeting);
                }
            });
    }
    
    SkyDrive.init                = function(callback) {
       Util.exec.series([
            load,
            auth,
            Util.exec.ret(callback)
        ]);
    };
    
    CloudCmd.SkyDrive    = SkyDrive;

})(CloudCmd, Util, DOM);
