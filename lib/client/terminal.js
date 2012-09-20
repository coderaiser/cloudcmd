var CloudCommander, $;
/* object contains terminal jqconsole */

(function(){
    "use strict";
    
    var cloudcmd                = CloudCommander,
        Util                    = CloudCommander.Util,
        KeyBinding              = CloudCommander.KeyBinding,
        TerminalId,
        Hidden                  = false;
    
    cloudcmd.Terminal           = {};    
    
    var jqconsole               = {};
        
            
    jqconsole.load              = (function(){
        Util.cssLoad({
            src : 'lib/client/terminal/jquery-terminal/jquery.terminal.css'
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
        
        var lLoadTerm_func = function(){
            Util.jsload('lib/client/terminal/jquery-terminal/jquery.terminal.js',
                function(){
                    jqconsole.init();
                    jqconsole.show();
                });
        };
        
        Util.jsload('lib/client/terminal/jquery-terminal/jquery.mousewheel.js',
            lLoadTerm_func);
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
        
        $(function($, undefined) {
            $('#terminal').terminal(function(command, term) {
                   term.echo('');
            });
        });
    };
        
 function jqueryLoad (pCallBack)
 {
    /* загружаем jquery: */
    Util.jsload('lib/client/terminal/jquery-terminal/jquery-1.7.1.min.js',
        function(){
            if(typeof pCallBack === 'function')
                pCallBack();
    });
}
    
    cloudcmd.Terminal.Keys      = (function(){        
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