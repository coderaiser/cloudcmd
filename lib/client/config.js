/* gui module for config.json editing */
var CloudCmd;

(function(){
    'use strict';
    
    var Config = {};
    
    Config.Show = (function(){
        console.log('config showed');
        
        var lFancyBox = CloudCmd.Viewer.FancyBox;
         lFancyBox.loadData({hreef: 'htlm/config.html'},
            lFancyBox.onDataLoaded);
    });
    
    Config.Keys = function(){
        console.log('config.js loaded');
        CloudCmd.Viewer(function(){
                Config.Show();
            });
    };
    
    CloudCmd.Config = Config;

})();