var CloudCommander, $;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
    
        Util                            = cloudcmd.Util,
        KeyBinding                      = cloudcmd.KeyBinding,
        TerminalId,
        Hidden                          = false;
    
    cloudcmd.Terminal                   = {};    
    
    var JqueryTerminal                  = {};
        
            
    JqueryTerminal.load                 = (function(){
        Util.cssLoad({
            src : 'lib/client/terminal/jquery-terminal/jquery.terminal.css'
        });
        
        Util.jsload('lib/client/socket.js');
        
        var lLoadTerm_func = function(){
            Util.jsload('lib/client/terminal/jquery-terminal/jquery.terminal.js',
                function(){
                    JqueryTerminal.init();
                    JqueryTerminal.show();
                });
        };
        
        Util.jsload('lib/client/terminal/jquery-terminal/jquery.mousewheel.js',
            lLoadTerm_func);
    });
    
    
    JqueryTerminal.init                 = (function(){
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
        
    JqueryTerminal.show                 = function(){
        Util.Images.hideLoad();
        Util.hidePanel();
        KeyBinding.unSet();
        
        $(function($, undefined) {
            $('#terminal').terminal(function(command, term) {
                JqueryTerminal.Term = term;
                term.echo('');
                cloudcmd.Socket.send(command);
            }, {
                greetings: 'Javascript Interpreter',
                prompt: 'cloudcmd>'
            });
        });
    };
    
    cloudcmd.Terminal.Keys              = (function(){        
        /* loading js and css*/
        Util.jqueryLoad( JqueryTerminal.load ); 
                
        var key_event = function(event){
            /* если клавиши можно обрабатывать */
            if(Hidden && KeyBinding.get() && event.keyCode === cloudcmd.KEY.TRA){
                Hidden = false;
                
                Util.show(TerminalId);                
                TerminalId.focus();
                
                JqueryTerminal.show();
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
    
    cloudcmd.Terminal.JqueryTerminal    = JqueryTerminal;
    
})();