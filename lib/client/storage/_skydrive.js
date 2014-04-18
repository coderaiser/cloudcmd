//http://isdk.dev.live.com/ISDK.aspx?category=scenarioGroup_skyDrive&index=0
var CloudCmd, Util, DOM, WL;

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var SkyDrive      = {};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * load google api library
     */
    function load(pCallBack){
        console.time('SkyDrive');
        var lUrl    = '//js.live.net/v5.0/wl.js';
        
        DOM.jsload(lUrl, function(){
            console.timeEnd('SkyDrive load');
            DOM.Images.hide();
            
            Util.exec(pCallBack);
        });
        
    }
    
    function auth() {
       CloudCmd.getModules(function(pModules){
            var lStorage    = Util.findObjByNameInArr(pModules, 'storage'),
                lSkyDrive    = Util.findObjByNameInArr(lStorage, 'SkyDrive'),
                lSkyDriveKey = lSkyDrive && lSkyDrive.id;
            
            WL.init({
                client_id: lSkyDriveKey,
                redirect_uri: CloudCmd.HOST,
            });
            
            WL.login({
                scope: ["wl.skydrive wl.signin"]
            }).then(
                function(response) {
                    Util.log(response);
                },
                function() {
                    Util.log("Failed to authenticate.");
                });
            
            WL.Event.subscribe("auth.login", onLogin);
        });
    }
    
   
    function onLogin() {
        var strGreeting = "";
        WL.api({
                path: "me",
                method: "GET"
            },
            
            function (response) {
                if (!response.error) {
                    strGreeting = "Hi, " + response.first_name + "!";
                    Util.log(strGreeting);
                }
            });
    }
    
    SkyDrive.init                = function(pCallBack){
       Util.loadOnLoad([
            load,
            auth,
            Util.retExec(pCallBack)
        ]);
    };
    
    CloudCmd.SkyDrive    = SkyDrive;

})(CloudCmd, Util, DOM);
