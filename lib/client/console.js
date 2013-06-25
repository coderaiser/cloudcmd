var CloudCmd, Util, DOM, $;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Console = new ConsoleProto(CloudCmd, Util, DOM);
        
    function ConsoleProto(CloudCmd, Util, DOM){
        var Name    = 'Console',
            Element,
            Key     = CloudCmd.Key,
            Images  = DOM.Images,
            Console = this;
            
        this.init                = function(pCallBack){
            var lViewFunc = CloudCmd.View.show || CloudCmd.View;
            
            Util.loadOnLoad([
                Console.show,
                load,
                lViewFunc,
                DOM.jqueryLoad,
                DOM.socketLoad
            ]);
            
            DOM.Events.addKey(listener);
            
            delete Console.init;
        };
        
        this.show                       = function(){
            var jqconsole;
            
            Images.showLoad({top:true});
            
            if (!Element) {
                Element         = DOM.anyload({
                    name        : 'div',
                    className   : 'console'
                });
            
                Console.jqconsole   = 
                jqconsole           = $(Element).jqconsole('', '# ');
                // Abort prompt on Ctrl+Z.
                jqconsole.RegisterShortcut('Z', function() {
                    jqconsole.AbortPrompt();
                    handler();
                });
                
                // Handle a command.
                var handler = function(command) {
                    if (command) {
                        Images.showLoad({ top:true });
                        CloudCmd.Socket.send(command);
                    }

                    jqconsole.Prompt(true, handler);
                };
                
                // Initiate the first prompt.
                handler();
            }
            
            CloudCmd.View.show(Element, function(){
                var lEvent      = DOM.Events.create('mouseup'),
                    lElement    = $('.jqconsole-prompt')[0];
                
                DOM.Events.dispatch(lEvent, lElement);
            });
        };
        
        
        this.hide                       =  function(){
            CloudCmd.View.hide();
        };
        
        function load(pCallBack){
            Util.time(Name + ' load');
        
            var lDir    =  CloudCmd.LIBDIRCLIENT + 'terminal/jq-console/',
                lFiles  = [
                    lDir + 'jqconsole.js',
                    lDir + 'jqconsole.css',
                    CloudCmd.LIBDIRCLIENT + 'terminal/jquery-terminal/jquery-migrate-1.0.0.js'
                ];
            
            DOM.anyLoadInParallel(lFiles, function(){
                console.timeEnd(Name + ' load');
                              
                Util.exec(pCallBack);
            });
        }
        
        function listener(pEvent){
            var lTRA        = Key.TRA,
                lESC        = Key.ESC,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
            switch(lKey){
                case lTRA:
                    if (lIsBind)
                        Console.show();
                    break;
                case lESC:
                    Console.hide();
                    break;
            }
                
        }
    }
    
})(CloudCmd, Util, DOM);