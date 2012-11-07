var CloudCommander, DOM, $;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
    
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
        console.time('terminal load');
        
        var lDir = 'lib/client/terminal/jquery-terminal/jquery.';
        
        DOM.cssLoad(lDir + 'terminal.css');
        
        DOM.socketLoad();
        
                
        DOM.anyLoadOnLoad([
            lDir + 'terminal.js',
            lDir + 'mousewheel.js'],
            
            function(){
                console.timeEnd('terminal load');
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
                Term.resize = function(){};
                
                $(window).unbind('resize');
                
                JqueryTerminal.show();
            });
    }
    
    /**
     * function do basic initialization
     */
    function init(){
        if(!TerminalId){
            var lFM = DOM.getById('fm');
            if(lFM)                
                TerminalId = DOM.anyload({
                    name        : 'div',
                    id          : 'terminal',
                    className   : 'panel',
                    parent      : lFM
                });
        }
        else
            console.log('Error. Something went wrong FM not found');
    }
    
    /* PUBLIC FUNCTIONS */
    
    /**
     * functin show jquery-terminal
     */
    JqueryTerminal.show                 = function(){
        DOM.Images.hideLoad();
        
        /* only if panel was hided */
        var lHided = DOM.hidePanel();
        if(lHided){
            Hidden = false;
            DOM.show(TerminalId);
            
            KeyBinding.unSet();
            
            Term.resume();
        }
    };
    
    /**
     * function hide jquery-terminal
     */
    JqueryTerminal.hide                 = function(){
        Hidden = true;
        
        DOM.hide(TerminalId);
        DOM.showPanel();
        
        KeyBinding.set();
        
        Term.pause();
    };
        
    /**
     * function bind keys
     */
    cloudcmd.Terminal.Keys              = function(){
        /* loading js and css*/
        DOM.jqueryLoad( load );
                
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
    };
    
    cloudcmd.Terminal.JqueryTerminal    = JqueryTerminal;
    
})();