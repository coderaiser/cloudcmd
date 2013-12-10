(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Contact = ContactProto;
        
    function ContactProto(pCallBack) {
        var Contact = this,
            Images  = DOM.Images,
            Key     = CloudCmd.Key,
            Inited  = false,
            DIR     = CloudCmd.LIBDIRCLIENT;
        
        function init(pCallBack) {
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
                    DOM.setButtonKey('contact', Contact.show);
                    
                    Util.exec(pCallBack);
                });
            }
        }
        
        function load(callback) {
            var path = DIR + 'contact/olark.js';
            
            Images.showLoad({top: true});
            
            DOM.jsload(path, function() {
                Util.exec(callback);
            });
        }
        
        function show() {
            Key.unsetBind();
            Images.hideLoad();
            
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
        
        function listener(pEvent) {
            var ESC     = Key.ESC,
                isBind  = Key.isBind(),
                key     = pEvent.keyCode;
            
            if (!isBind && key === ESC)
                Contact.hide();
        }
        
        init(pCallBack);
    }
    
})(CloudCmd, Util, DOM);
