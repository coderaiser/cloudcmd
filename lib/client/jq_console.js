var CloudCmd, Util, DOM, $;
(function(CloudCmd, Util, DOM){
    'use strict';
    
    CloudCmd.Jq_console = new ConsoleProto(CloudCmd, Util, DOM);
        
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
            
            delete Console.init;
        };
        
        this.show                       = function(){
            var lElement, jqconsole;
            
            Images.showLoad({top:true});
            
            lElement    = DOM.anyload({
                name        : 'div',
                className   : 'console'
            });
        
            jqconsole = $(lElement).jqconsole('header', 'JS> ');
    
            // Abort prompt on Ctrl+Z.
            jqconsole.RegisterShortcut('Z', function() {
              jqconsole.AbortPrompt();
              handler();
            });
            
            // Move to line start Ctrl+A.
            jqconsole.RegisterShortcut('A', function() {
              jqconsole.MoveToStart();
              handler();
            });
            
            // Move to line end Ctrl+E.
            jqconsole.RegisterShortcut('E', function() {
              jqconsole.MoveToEnd();
              handler();
            });
            
            jqconsole.RegisterMatching('{', '}', 'brace');
            jqconsole.RegisterMatching('(', ')', 'paran');
            jqconsole.RegisterMatching('[', ']', 'bracket');
            // Handle a command.
            var handler = function(command) {
              if (command) {
                try {
                  jqconsole.Write('==> ' + window.eval(command) + '\n');
                } catch (e) {
                  jqconsole.Write('ERROR: ' + e.message + '\n');
                }
              }
              jqconsole.Prompt(true, handler, function(command) {
                // Continue line if can't compile the command.
                try {
                  Function(command);
                } catch (e) {
                  if (/[\[\{\(]$/.test(command)) {
                    return 1;
                  } else {
                    return 0;
                  }
                }
                return false;
              });
            };
    
            // Initiate the first prompt.
            handler();
      
            
            CloudCmd.View.show(lElement);
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
            var lF10        = Key.F10,
                lESC        = Key.ESC,
                lIsBind     = Key.isBind(),
                lKey        = pEvent.keyCode;
            
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