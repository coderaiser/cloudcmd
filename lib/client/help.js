var CloudCmd, Util, DOM;

(function(CloudCmd, Util, DOM) {
    'use strict';
    
    CloudCmd.Help = HelpProto;
        
    function HelpProto() {
        var Images      = DOM.Images,
            Help        = this;
            
        function init() {
            Images.show.load('top');
            Help.show();
        }
        
        this.show                       = function() {
            CloudCmd
                .Markdown
                .show('/HELP.md', {
                    positionLoad    : 'top',
                    relative        : true
                });
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
