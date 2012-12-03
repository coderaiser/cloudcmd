var CloudCommander, DOM, Dropbox; //o7d6llji052vijk
/* module for work with github */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
        CLIENT_ID,
        DropBoxStore                    = {},
        options                         = {
            linkType: "direct",
            success: function(files) {
                        console.log("Here's the file link:" + files[0].link);
            },
            cancel:  function() {
                console.log('Chose something');
            }
        };
        
    cloudcmd.Storage                    = {};
    
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads dropbox.js
     */
    function load(){
        console.time('dropbox load');
        
        var lElement = DOM.anyload({
            src         : 'https://www.dropbox.com/static/api/1/dropbox.js',
            not_append  : true,
            id          : 'dropboxjs',
            func        :  DropBoxStore.choose
        
        });
        
        lElement.setAttribute('data-app-key', 'o7d6llji052vijk');
        document.body.appendChild(lElement);
    }

    DropBoxStore.choose = function(){
        Dropbox.choose(options);
    };

    cloudcmd.Storage.Keys              = function(){
        load();
    };
    
    cloudcmd.Storage.DropBoxStore    = DropBoxStore;
})();
