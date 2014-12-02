var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Help = HelpProto;
        
    function HelpProto() {
        var Images      = DOM.Images,
            Help        = this;
            
        function init() {
            Images.show.load({
                top: true
            });
            
            Help.show();
        }
        
        this.show                       = function() {
            CloudCmd
                .Markdown
                .show('/HELP.md', {
                    topLoad : true,
                    relative: true
                });
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
