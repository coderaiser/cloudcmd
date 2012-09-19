var CloudCommander;
/* object contains terminal jqconsole */

(function(){
    var cloudcmd                = CloudCommander,
        Util                    = CloudCommander.Util,
        KeyBinding              = CloudCommander.KeyBinding,
        JQConsole,
        TerminalId,
        Hidden                  = false;
    
    cloudcmd.Terminal           = {};    
    
    var jqconsole               = {};
        
            
    jqconsole.load              = (function(){
            Util.cssLoad({
                src : 'lib/client/terminal/jqconsole/ansi.css'
            });
            
            Util.cssSet({
                id      :'terminal-css',
                inner   :'#terminal{'                   +
                            'position : relative'       +
                        '},'                            +
                        '#terminal::selection{'         +
                                'background: #fe57a1;'  +
                                'color: #fff;'          +
                                'text-shadow: none;'    +
                        '}'
            });
            
            Util.jsload('lib/client/terminal/jqconsole/jqconsole-2.7.min.js', function(){
                jqconsole.init();
                jqconsole.show();
            });
        });
        
    jqconsole.init              = (function(){
        if(!TerminalId){
            var lFM = Util.getById('fm');
            if(lFM)                
                TerminalId = Util.anyload({
                    name        : 'div',
                    id          : 'terminal',
                    className   : 'panel',
                    parent      : lFM
                });
        }
        else
            console.log('Error. Something went wrong FM not found');
    });
        
    jqconsole.show              = function(){
        Util.Images.hideLoad();
        Util.hidePanel();
        KeyBinding.unSet();
        
        $(function () {
            if(!JQConsole){
                JQConsole = $('#terminal').jqconsole('Hi\n', '>>>');
                var startPrompt = function () {
                    // Start the prompt with history enabled.
                    JQConsole.Prompt(true, function (input) {
                        // Output input with the class jqconsole-output.
                        JQConsole.Write(input + '\n', 'jqconsole-output');
                        
                        console.log(input);
                        // Restart the prompt.
                        startPrompt();
                    });
                };
                startPrompt();
            }
        });
    };
        
    
    cloudcmd.Terminal.Keys      = (function(){
        "use strict";
        
        /* loading js and css*/
        Util.jqueryLoad( jqconsole.load ); 
                
        var key_event = function(event){
            /* если клавиши можно обрабатывать */
            if(Hidden && KeyBinding.get() && event.keyCode === cloudcmd.KEY.TRA){
                Hidden = false;
                
                Util.show(TerminalId);                
                TerminalId.focus();
                
                jqconsole.show();
            }
            
            if(!Hidden && event.keyCode === cloudcmd.KEY.ESC){
                Hidden = true;
                Util.hide(TerminalId);
                                
                Util.showPanel();
                Util.getPanel().focus();
                KeyBinding.set();
            }
        };
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event, false);
            
        else        
            document.onkeypress = key_event;
    });
        
    cloudcmd.Terminal.jqconsole = jqconsole;
})();