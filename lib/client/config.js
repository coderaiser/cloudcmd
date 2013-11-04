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
                success:  function (data) {
                    CloudCmd.getConfig(function(config) {
                        var lDiv, obj = {};
                        
                        Util.copyObj(config, obj);
                        
                        changeConfig(obj);
                        
                        data = Util.render(data, obj);
                          
                        lDiv = DOM.anyload({
                            name    : 'div',
                            id      : 'config',
                            inner   : data.toString()
                        });
                        
                        Images.hideLoad();
                        CloudCmd.View.show(lDiv);
                    });
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
        
        function changeConfig(config) {
            var name;
            
            for (name in config)
                if (Util.isBoolean(config[name]))
                    config[name] = setState(config[name]);
        }
        
        function setState(state) {
            var ret = "";
            
            if (state)
                ret = " checked";
            
            return ret;
        }
    }
    
})(CloudCmd, Util, DOM);
