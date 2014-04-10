var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Help = HelpProto;
        
    function HelpProto() {
        var Images      = DOM.Images,
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
            var name = '/HELP.md?relative';
            
            Images.showLoad({
                top:true
            });
            
            Markdown.read(name, function(result) {
                var div = DOM.anyload({
                        name        : 'div',
                        className   : 'help',
                        inner       : result
                    });
                
                Images.hideLoad();
                
                CloudCmd.View.show(div);
            });
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
