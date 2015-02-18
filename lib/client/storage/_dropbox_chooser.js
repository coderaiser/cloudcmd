var Util, CloudCmd, DOM, Dropbox;

(function(Util, CloudCmd, DOM) {
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
    function load() {
        Util.time('dropbox load');
        
        DOM.Files.get('config', function(error, config) {
            var element = DOM.load({
                src         : CHOOSER_API,
                notAppend   : true,
                id          : 'dropboxjs',
                func        :  DropBoxStore.choose
            
            });
            
            var lDropBoxId = config.dropbox_chooser_key;
            element.setAttribute('data-app-key', lDropBoxId);
            document.body.appendChild(element);
            
            Util.timeEnd('dropbox load');
        });
    }
    
    DropBoxStore.choose = function() {
        Dropbox.choose(options);
    };
    
    DropBoxStore.init                = function() {
        load();
    };
    
    CloudCmd.DropBox    = DropBoxStore;
})(Util, CloudCmd, DOM);
