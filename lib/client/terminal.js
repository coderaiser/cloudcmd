var CloudCommander, jqconsole;
/* object contains terminal jqconsole */

(function(){
    var cloudcmd                = CloudCommander;
    var Util                    = CloudCommander.Util;
    
    cloudcmd.Terminal           = {};
    
    jqconsole                   = {};
            
    jqconsole.load              = (function(pParent){
            Util.cssLoad({
                src : 'lib/client/terminal/ansi.css'
            });
        
            Util.jsload('lib/client/terminal/jqconsole-2.7.min.js', function(){
                pParent.init();
            });
        });
        
    jqconsole.init              = (function(){
        var lFM = Util.getById('fm');
        if(lFM){
            var lTerminal = Util.getById('terminal');
            if(!lTerminal){
                Util.anyload({
                    name    : 'div',
                    id      : 'terminal',
                    parent  : lFM
                });
            }
        }
        else
            console.log('Error. Something went wrong FM not found');
    });
        
    jqconsole.show              = function(){        
        $(function () {
            var jqconsole = $('#terminal').jqconsole('Hi\n', '>>>');
            var startPrompt = function () {
                // Start the prompt with history enabled.
                jqconsole.Prompt(true, function (input) {
                    // Output input with the class jqconsole-output.
                    jqconsole.Write(input + '\n', 'jqconsole-output');
                    // Restart the prompt.
                    startPrompt();
                });
            };
            startPrompt();
        })();
    };
        
    
    cloudcmd.Terminal.Keys      = (function(){
        "use strict";
        
        /* loading js and css of CodeMirror */
        jqconsole.load(jqconsole);
        
        var key_event=function(event){
    
            /* если клавиши можно обрабатывать */
            if(cloudcmd.keyBinded){
                /* if f4 pressed */
                if(event.keyCode===114 &&
                    event.altKey){
                        jqconsole.show();
                }
            }
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event,false);
            
        else        
            document.onkeypress=key_event;
    });
        
    cloudcmd.Terminal.jqconsole = jqconsole;
})();