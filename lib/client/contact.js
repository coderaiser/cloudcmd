var CloudCmd, Util, DOM, olark;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Contact = ContactProto;
    
    function ContactProto(callback) {
        var Contact = this,
            Images  = DOM.Images,
            Key     = CloudCmd.Key,
            Inited  = false,
            DIR     = CloudCmd.LIBDIRCLIENT;
        
        function init(callback) {
            if (!Inited) {
                Contact.show = show;
                Contact.hide = hide;
                
                load(function() {
                    Inited = true;
                    
                    olark('api.box.onExpand',   Contact.show);
                    olark('api.box.onShow',     Contact.show);
                    olark('api.box.onHide',     Contact.hide);
                    olark('api.box.onShrink',   Contact.hide);
                    
                    DOM.Events.addKey(listener);
                    Util.exec(callback);
                });
            }
        }
        
        function load(callback) {
            var path = DIR + 'contact/olark.js';
            
            Images.show.load({top: true});
            
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
            
            if (Inited)
                olark('api.box.hide');
            else
                init(Contact.hide);
        }
        
        function listener(event) {
            var ESC     = Key.ESC,
                isBind  = Key.isBind(),
                key     = event.keyCode;
            
            if (!isBind && key === ESC)
                Contact.hide();
        }
        
        init(callback);
    }
    
})(CloudCmd, Util, DOM);
