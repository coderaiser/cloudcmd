var CloudCommander, Util, DOM, Dropbox;
/* module for work with github */

(function(){
    "use strict";
    
    const   cloudcmd                        = CloudCommander;
    
    var     CLIENT_ID,
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

    DropBoxStore.init                = function(){
        load();
        this.init = null;
    };
    
    cloudcmd.DropBox    = DropBoxStore;
})();
