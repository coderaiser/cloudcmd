var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Config = new ConfigProto(CloudCmd, Util, DOM);
        
    function ConfigProto(CloudCmd, Util, DOM){
        var Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Config  = this;
            
        this.init                = function(pCallBack){
            Util.loadOnLoad([
                Config.show,
                CloudCmd.View,
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f10', Config.show);
            
            delete Config.init;
        };
        
        this.show                       = function(){
            Images.showLoad({top:true});
             
            DOM.ajax({
                url: '/css/config.css', 
                success:  function (data){
                    DOM.cssSet({
                        id      : 'config-css',
                        inner   : data
                    });
                        
                    Images.hideLoad();
                },
                
                error:Images.showError
            });
            
            DOM.ajax({
                url: '/html/config.html', 
                success:  function (data){
                      var lDiv = DOM.anyload({
                            name    : 'div',
                            id      : 'config',
                            inner   : data.toString()
                        });
                        
                        Images.hideLoad();
                        CloudCmd.View.show(lDiv);
                },
                
                error:Images.showError
            });
        };
        
        
        this.hide                       =  CloudCmd.View.hide;
        
        function listener(pEvent){
            var f10         = Key.F10,
                isBind      = Key.isBind(),
                key         = pEvent.keyCode;
            
            /* если клавиши можно обрабатывать */
            if (isBind && key === f10)
                Config.show();
        }
    }
    
})(CloudCmd, Util, DOM);