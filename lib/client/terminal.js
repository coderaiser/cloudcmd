var CloudCommander, jqconsole;
/* object contains terminal jqconsole */

(function(){
    var cloudcmd            = CloudCommander;
    var Util                = CloudCommander.Util;
            
    jqconsole.load          = (function(pParent){
            Util.cssLoad({
                src : 'lib/client/terminal/ansi.css'
            });
        
            Util.jsload({
                src  : 'lib/client/terminal/jqconsole-2.7.min.js',
                func : function(){
                    pParent.init();
                }
            });
        });
        
    jqconsole.init          = (function(){
        var pConsole = document.getById('terminal');
        if(!pConsole){
            Util.anyload({
                name    : 'div',
                id      :'terminal'
            });
        }
    });
        
    jqconsole.show          = function(){        
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
        });
    };
        
    
    cloudcmd.Terminal.Keys  = (function(){
        "use strict";
        
        /* loading js and css of CodeMirror */
        cloudcmd.Terminal.load(this.jqconsole);
        
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
    
    CloudCommander.Terminal = {};
    CloudCommander.Terminal.jqconsole = jqconsole;
});