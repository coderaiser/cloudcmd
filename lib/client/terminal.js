var CloudCommander, $;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
    
        Util                            = cloudcmd.Util,
        KeyBinding                      = cloudcmd.KeyBinding,
        TerminalId,
        Term,
        Hidden                          = false;
        
    cloudcmd.Terminal                   = {};    
    
    var JqueryTerminal                  = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads jquery-terminal
     */
    function load(){
        Util.cssLoad({
            src : 'lib/client/terminal/jquery-terminal/jquery.terminal.css'
        });
        
        Util.jsload('lib/client/socket.js');
        
        var lLoadTerm_func = function(){            
            Util.jsload('lib/client/terminal/jquery-terminal/jquery.terminal.js',
                function(){
                    init();
                                        
                    $(function($, undefined) {
                        Term = JqueryTerminal.Term = $('#terminal').terminal(function(command, term){                        
                            term.echo('');
                            cloudcmd.Socket.send(command);
                        }, {
                            greetings   : '[[;#729FCF;]Cloud Commander Terminal]',
                            prompt      : '[[;#729FCF;]cloudcmd> ]',
                            color       : '#729FCF;'
                        });
                    });
                    /* removing resize function, no need for us */                    
                    Term.resize = function(pEvent){};
                    
                    $(window).unbind('resize');
                    
                    JqueryTerminal.show();
                });
        };
        
        Util.jsload('lib/client/terminal/jquery-terminal/jquery.mousewheel.js',
            lLoadTerm_func);
    }
    
    /**
     * function do basic initialization
     */
    function init(){
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
    }
    
    /* PUBLICK FUNCTIONS */
    
    /**
     * functin show jquery-terminal
     */
    JqueryTerminal.show                 = function(){
        Util.Images.hideLoad();
        
        /* only if panel was hided */
        var lHided = Util.hidePanel();
        if(lHided){
            Hidden = false;
            Util.show(TerminalId);
            
            KeyBinding.unSet();
            
            Term.resume();
        }
    };
    
    /**
     * function hide jquery-terminal
     */
    JqueryTerminal.hide                 = function(){
        Hidden = true;
        
        Util.hide(TerminalId);
        Util.showPanel();
        
        KeyBinding.set();
        
        Term.pause();
    };
    
    
    /**
     * function bind keys
     */
    cloudcmd.Terminal.Keys              = (function(){        
        /* loading js and css*/
        Util.jqueryLoad(load); 
                
        var key_event = function(event){
            /* если клавиши можно обрабатывать */
            if(Hidden               &&
                KeyBinding.get()    &&
                event.keyCode === cloudcmd.KEY.TRA){
                    JqueryTerminal.show();
                    event.preventDefault();
                }
            
            else if(!Hidden && event.keyCode === cloudcmd.KEY.ESC)
                JqueryTerminal.hide();
            
            
        };
            
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event, false);
            
        else
            document.onkeypress = key_event;
    });
    
    cloudcmd.Terminal.JqueryTerminal    = JqueryTerminal;
    
})();