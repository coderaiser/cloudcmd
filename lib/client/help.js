var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Help = HelpProto;
        
    function HelpProto(CallBack){
        var Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Help    = this;
            
        function init() {
            Util.loadOnLoad([
                CloudCmd.View,
                Help.show,
            ]);
        }
        
        this.show                       = function() {
            Images.showLoad({
                top:true
            });
            
            DOM.ajax({
                url     : '/HELP.md', 
                success : function (data) {
                    DOM.ajax({
                        method  : 'put',
                        url     : '/api/v1/markdown',
                        data    : data,
                        success : function(result) {
                            var div = DOM.anyload({
                                    name        : 'div',
                                    className   : 'help',
                                    inner       : result
                                });
                            
                            Images.hideLoad();
                            
                            CloudCmd.View.show(div);
                        }
                    });
                },
                
                error   : Images.showError
            });
        };
        
        this.hide                       = function() {
            CloudCmd.View.hide();
        };
        
        init();
    }
    
})(CloudCmd, Util, DOM);
