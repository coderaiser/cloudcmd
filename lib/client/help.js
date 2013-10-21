var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Help = new HelpProto(CloudCmd, Util, DOM);
        
    function HelpProto(CloudCmd, Util, DOM){
        var Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Help    = this;
            
        this.init                = function(pCallBack){
            Util.loadOnLoad([
                Help.show,
                CloudCmd.View,
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f1', Help.show);
            
            delete Help.init;
        };
        
        this.show                       = function(){
            Images.showLoad({top:true});
            DOM.ajax({
                url: '/HELP.md', 
                success:  function (pData){
                    var lData = {text: pData};
                    DOM.ajax({
                        method  : 'post',
                        url     : 'https://api.github.com/markdown',
                        data    : Util.stringifyJSON(lData),
                        success:function(pResult){
                            var lDiv = DOM.anyload({
                                name    : 'div',
                                style   : 'white-space: normal; margin: 25px',
                                inner   : pResult.toString()
                            });
                            
                            Images.hideLoad();
                            CloudCmd.View.show(lDiv);
                        },
                    
                        error: Images.showError
                    });
                },
                
                error:Images.showError
            });
        };
        
        
        this.hide                       =  CloudCmd.View.hide;
        
        function listener(pEvent){
            var lF1         = Key.F1,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            /* если клавиши можно обрабатывать */
            if (lIsBind && lKey === lF1)
                Help.show();
        }
    }
    
})(CloudCmd, Util, DOM);