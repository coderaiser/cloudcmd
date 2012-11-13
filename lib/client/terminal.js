var CloudCommander, Util, DOM, $;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                        = CloudCommander,
    
        KeyBinding                      = cloudcmd.KeyBinding,
        TerminalId,
        Term,
        Hidden                          = false,
        JqueryTerminal                  = {};
        
    cloudcmd.Terminal                   = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads jquery-terminal
     */
    function load(pCallBack){
        console.time('terminal load');
        
        var lDir = 'lib/client/terminal/jquery-terminal/jquery.';
        DOM.cssLoad(lDir + 'terminal.css');        
        
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
                
                Util.exec(pCallBack);
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
        if( DOM.hidePanel() ){
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
        DOM.jqueryLoad(function(){
            Util.loadOnLoad([
                JqueryTerminal.show,
                load,
                DOM.socketLoad
            ]);
        });
        
        /* добавляем обработчик клавишь */
       DOM.addKeyListener(function(){
            /* если клавиши можно обрабатывать */
            if(Hidden && KeyBinding.get()    &&
                event.keyCode === cloudcmd.KEY.TRA){
                    JqueryTerminal.show();
                    event.preventDefault();
                }
            
            else if(!Hidden && event.keyCode === cloudcmd.KEY.ESC)
                JqueryTerminal.hide();
        });
    };
    
    cloudcmd.Terminal.JqueryTerminal    = JqueryTerminal;    
})();
