var join, DOM;

(function(global, join, DOM, load) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new edward();
    else
        global.edward   = new edward();
    
    function edward() {
        var Element,
            ElementMsg,
            
            ed      = function(el, callback) {
            Element = el || document.body;
            loadFiles(callback);
        };
        
        function createMsg() {
            var msg,
                wrapper = document.createElement('div'),
                html    = '<div class="edward-msg">/div>';
            
            wrapper.innerHTML = html;
            msg = wrapper.firstChild;
            
            return msg;
        }
        
        ed.showMessage = function(text) {
            var HIDE_TIME   = 2000;
            
            /* 
             * Msg should be created and removed
             * if it's not and just inner text
             * is changing, when hide and show of DOM
             * is called - bug occures: empty box
             * with no text inside.
             */
            
            if (!ElementMsg) {
                ElementMsg = createMsg();
                Element.appendChild(ElementMsg);
            }
            
            ElementMsg.textContent = text;
            ElementMsg.hidden = false;
            
            setTimeout(function() {
                ElementMsg.hidden = true;
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
                load.parallel([url, css], callback);
            });
        }
        
        return ed;
    }
    
})(this, join, DOM, DOM.load);
