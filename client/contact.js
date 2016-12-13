var CloudCmd, Util, DOM, olark;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Contact = ContactProto;
    
    function ContactProto(callback) {
        var Contact = this,
            Events  = DOM.Events,
            Images  = DOM.Images,
            Key     = CloudCmd.Key,
            Inited  = false;
        
        function init(callback) {
            if (!Inited) {
                Contact.show = show;
                Contact.hide = hide;
                
                load(function() {
                    Inited = true;
                    
                    olark.identify('6216-545-10-4223');
                    olark('api.box.onExpand',   Contact.show);
                    olark('api.box.onShow',     Contact.show);
                    olark('api.box.onShrink',   Contact.hide);
                    
                    Util.exec(callback);
                });
                
                Events.addKey(onKey);
            }
        }
        
        function load(callback) {
            var prefix  = CloudCmd.PREFIX,
                path    = prefix + '/modules/olark/olark.min.js';
            
            Images.show.load('top');
            
            DOM.load.js(path, callback);
        }
        
        function show() {
            Key.unsetBind();
            Images.hide();
            
            if (Inited)
                olark('api.box.expand');
            else
                init(Contact.show);
        }
        
        function hide() {
            Key.setBind();
            olark('api.box.hide');
        }
        
        function onKey(event) {
            var keyCode = event.keyCode,
                ESC     = Key.ESC;
            
            if (keyCode === ESC)
                hide();
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM);
