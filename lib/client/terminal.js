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
            $(function($) {
                Term = JqueryTerminal.Term = $('#terminal').terminal(function(command, term){
                    term.echo('');
                    CloudCmd.Socket.send(command);
                }, {
                    greetings   : '[[;#729FCF;]CloudCmd Terminal]',
                    prompt      : '[[;#729FCF;]cloudcmd> ]',
                    color       : '#729FCF;'
                });
            });
            /* removing resize function, no need for us */
            $(window).unbind('resize');
            
            Util.exec(pCallBack);
        }).cssSet({id:'terminal-css',
             inner: '.terminal{'       +
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
                className   : 'panel terminal',
                parent      : DOM.getFM()
            });
    }
    
    /**
     * functin show jquery-terminal
     */
    JqueryTerminal.show                 = function(){
        DOM.Images.hideLoad();
        /* only if panel was hided */
        if( DOM.hidePanel() ){
            Hidden = false;
            DOM.show(TerminalId);
            Key.unsetBind();
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
        Key.setBind();
        
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
        
        DOM.Events.addKey(lListener);
        
        function lListener(pEvent){
            var lRet        = true,
                lESC        = Key.ESC,
                lTRA        = Key.TRA,
                lKey        = pEvent.keyCode,
                lIsBind     = Key.isBind();
            
            switch(lKey){
                case lTRA:
                    if(Hidden &&  lIsBind){
                        JqueryTerminal.show();
                        DOM.preventDefault(pEvent);
                        lRet = false;
                    }
                    break;
            
                case lESC:
                    if(!Hidden)
                        JqueryTerminal.hide();
                    break;
            }
            
            return lRet;
        }
    };
    
    CloudCmd.Terminal.JqueryTerminal    = JqueryTerminal;
    
})(CloudCmd, Util, DOM);
