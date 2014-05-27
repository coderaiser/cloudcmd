var CloudCmd, DOM, Dropbox;

(function(CloudCmd, DOM){
    'use strict';
    
    var CHOOSER_API                     = 'https://www.dropbox.com/static/api/1/dropbox.js',
        DropBoxStore                    = {},
        options                         = {
            linkType: 'direct',
            success: function(files) {
                console.log('Here\'s the file link:' + files[0].link);
            },
            cancel:  function() {
                console.log('Chose something');
            }
        };
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads dropbox.js
     */
    function load(){
        console.time('dropbox load');
        
        CloudCmd.getConfig(function(pConfig){
            var lElement = DOM.anyload({
                src         : CHOOSER_API,
                notAppend   : true,
                id          : 'dropboxjs',
                func        :  DropBoxStore.choose
            
            });
            
            var lDropBoxId = pConfig.dropbox_chooser_key;
            lElement.setAttribute('data-app-key', lDropBoxId);
            document.body.appendChild(lElement);
            
            console.timeEnd('dropbox load');
        });
    }
    
    DropBoxStore.choose = function(){
        Dropbox.choose(options);
    };
    
    DropBoxStore.init                = function(){
        load();
    };
    
    CloudCmd.DropBox    = DropBoxStore;
})(CloudCmd, DOM);
