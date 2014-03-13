var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Help = HelpProto;
        
    function HelpProto(CallBack){
        var Key         = CloudCmd.Key,
            Images      = DOM.Images,
            RESTful     = DOM.RESTful,
            Markdown    = RESTful.Markdown,
            Help        = this;
            
        function init() {
            Images.showLoad({
                top:true
            });
            
            Util.loadOnLoad([
                CloudCmd.View,
                Help.show,
            ]);
        }
        
        this.show                       = function() {
            Images.showLoad({
                top:true
            });
            
            Markdown.read('/HELP.md', function(result) {
                var div = DOM.anyload({
                        name        : 'div',
                        className   : 'help',
                        inner       : result
                    });
                
                Images.hideLoad();
                
                CloudCmd.View.show(div);
            }, '?relative');
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
