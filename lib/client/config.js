/* gui module for config.json editing */
var CloudCommander;

(function(){
    "use strict";
    
    var cloudcmd = CloudCommander;
    
    var Config = {};
    
    Config.Show = (function(){
        console.log('config showed');
    });
    
    Config.Keys = function(){
        console.log('config.js loaded');
        cloudcmd.Viewer(function(){
                Config.Show();
            });
    };
    
    cloudcmd.Config = Config;

})();