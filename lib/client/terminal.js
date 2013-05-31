var CloudCmd, Util, DOM, $;
/* object contains terminal jqconsole */

(function(CloudCmd, Util, DOM){
    'use strict';
    
    var Key                             = CloudCmd.Key,
        TerminalId,
        Term,
        Hidden                          = false,
        JqueryTerminal                  = {};
        
    CloudCmd.Terminal                   = {};
        
    /* PRIVATE FUNCTIONS */
    
    /**
     * function loads jquery-terminal
     */
    function load(pCallBack){
        Util.time('terminal load');
        
        var lDir    = '/lib/client/terminal/jquery-terminal/jquery.',
            lFiles  = [
                lDir + 'terminal.js',
                lDir + 'mousewheel.js',
                lDir + 'terminal.css'
            ],
            lJqueryMigrate = '//code.jquery.com/jquery-migrate-1.0.0.js';
            /* //github.com/jquery/jquery-migrate/ */
        
        DOM.anyLoadOnLoad([lFiles, lJqueryMigrate], function(){
            Util.timeEnd('terminal load');
            init();
            $(function($, undefined) {
                Term = JqueryTerminal.Term = $('#terminal').terminal(function(command, term){
                    term.echo('');
                    CloudCmd.Socket.send(command);
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
        }).cssSet({id:'terminalStyle',
             inner: '.cloudTerminal{'       +
                        'height: 720px;'    +
                    '};'
        });
    }
    
    /**
     * function do basic initialization
     */
    function init(){
        if(!TerminalId)
            TerminalId = DOM.anyload({
                name        : 'div',
                id          : 'terminal',
                className   : 'panel cloudTerminal',
                parent      : DOM.getFM()
            });
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
            Key.unSet();
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
        Key.set();
        
        Term.pause();
    };
        
    /**
     * function bind keys
     */
    CloudCmd.Terminal.init              = function(){
        Util.loadOnLoad([
            JqueryTerminal.show,
            load,
            DOM.socketLoad,
            DOM.jqueryLoad,
        ]);
        
        DOM.Events.addKey( lListener );
        
        function lListener(pEvent){
            var lRet        = true,
                lKEY        = CloudCmd.KEY,
                lESC        = lKEY.ESC,
                lTRA        = lKEY.TRA,
                lKey        = pEvent.keyCode,
                lBinded     = Key.get();
            /* если клавиши можно обрабатывать */
            if(Hidden &&  lBinded && lKey === lTRA){
                JqueryTerminal.show();
                DOM.preventDefault(pEvent);
                lRet = false;
            }
            
            else if(!Hidden && lKey === lESC)
                JqueryTerminal.hide();
            
            return lRet;
        }
    };
    
    CloudCmd.Terminal.JqueryTerminal    = JqueryTerminal;
    
})(CloudCmd, Util, DOM);
