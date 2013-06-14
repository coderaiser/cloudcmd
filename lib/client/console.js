var CloudCmd, Util, DOM, $;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Console = new ConsoleProto(CloudCmd, Util, DOM);
        
    function ConsoleProto(CloudCmd, Util, DOM){
        var Name    = 'Console',
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Console = this;
            
        this.init                = function(pCallBack){
            Util.loadOnLoad([
                Console.show,
                load,
                CloudCmd.View,
                DOM.jqueryLoad,
            ]);
            
            DOM.Events.addKey(listener);
            DOM.setButtonKey('f10', Console.show);
            
            delete Console.init;
        };
        
        this.show                       = function(){
            var lElement;
            
            Images.showLoad({top:true});
            
            lElement = DOM.anyload({
                name        : 'div',
                className   : 'console',
            });
            
            $(lElement).console({
                promptLabel: '# ',
                commandValidate : function(line){
                    var lRet = line !== "";
                    
                    return lRet;
                },
                commandHandle   : function(line){
                    return line;
                },
                autofocus       : true,
                animateScroll   : true,
                promptHistory   : true,
            });
            
            CloudCmd.View.show(lElement);
        };
        
        
        this.hide                       =  function(){
            CloudCmd.View.hide;
        };
        
        function load(pCallBack){
            Util.time(Name + ' load');
        
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'terminal/jquery-console/',
                lFiles  = [
                    lDir + 'jquery.console.js',
                    lDir + 'jquery.console.css'
                ];
            
            DOM.anyLoadInParallel(lFiles, function(){
                console.timeEnd(Name + ' load');
                              
                Util.exec(pCallBack);
            });
        }
        
        function listener(pEvent){
            var lF10        = Key.F10,
                lESC        = Key.ESC,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            /* если клавиши можно обрабатывать */
            if (lIsBind)
                switch(lKey){
                    case lF10:
                        Console.show();
                        break;
                    case lESC:
                        Console.hide();
                        break;
                }
                
        }
    }
    
})(CloudCmd, Util, DOM);