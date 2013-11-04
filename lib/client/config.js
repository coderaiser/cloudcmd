var CloudCmd, Util, DOM;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Config = new ConfigProto(CloudCmd, Util, DOM);
        
    function ConfigProto(CloudCmd, Util, DOM){
        var Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Events  = DOM.Events,
            ESC     = CloudCmd.Key.ESC,
            INPUT   = 'INPUT',
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
                        var i, n, div, li, param, obj = {}; 
                        
                        Util.copyObj(config, obj);
                        
                        changeConfig(obj);
                        
                        data = Util.render(data, obj);
                          
                        div = DOM.anyload({
                            name    : 'div',
                            id      : 'config',
                            inner   : data.toString()
                        });
                        
                        li  = DOM.getByTag(INPUT, div);
                        n   = li.length;
                        
                        for (i = 0; i < n; i++) {
                            param = li[i];
                            Events.add('change', change, param);
                            Events.addKey(key, param);
                        }
                        
                        Images.hideLoad();
                        CloudCmd.View.show(div);
                    });
                },
                
                error:Images.showError
            });
        };
        
        this.hide                       =  CloudCmd.View.hide
        
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
        
        function change(event) {
            Util.log(event);
        }
        
        function key(event) {
            var keyCode = event.keyCode;
            
            if (keyCode === ESC)
                Config.hide();
        }
    }
    
})(CloudCmd, Util, DOM);
