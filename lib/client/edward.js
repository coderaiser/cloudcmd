var join, Util, DOM;

(function(global, join, DOM, exec) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new edward();
    else
        global.edward   = new edward();
    
    function edward() {
        var Element,
            ed      = function(el, callback) {
            Element = el || document.body;
            loadFiles(callback);
        };
        
        ed.showMessage = function(text) {
            var msg, HIDE_TIME = 2000;
            
            /* 
             * Msg should be created and removed
             * if it's not and just inner text
             * is changing, and hide and show of DOM
             * is called - bug occures: empty box
             * with no text inside.
             */
            msg = DOM.load({
                name        : 'div',
                className   : 'edward-msg',
                parent      : Element,
                inner       : text,
                func        : alert
            });
            
            setTimeout(function() {
                DOM.remove(msg, Element);
            }, HIDE_TIME);
        };
        
        function loadFiles(callback) {
            var css = '/css/edward.css',
                dir = '/modules/ace-builds/src-noconflict/',
                url = join([
                    'theme-tomorrow_night_blue',
                    'ext-language_tools',
                    'ext-searchbox',
                    'ext-modelist'
                ].map(function(name) {
                    return dir + name + '.js';
                }));
            
            DOM.loadRemote('ace', function() {
                DOM.load.parallel([url, css], function() {
                    exec(callback);
                });
            });
        }
        
        return ed;
    }
    
})(this, join, DOM, Util.exec);
