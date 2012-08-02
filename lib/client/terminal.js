var CloudCommander, jqconsole;
/* object contains terminal jqconsole
 */
CloudCommander.Terminal = {};
CloudCommander.Terminal.jqconsole = {
    load: function(pParent){
        CloudCommander.cssLoad({
            src : 'lib/client/terminal/ansi.css'
        });
    
        CloudCommander.jsload({
            src  : 'lib/client/terminal/jqconsole-2.7.min.js',
            func : function(){
                pParent.init();
            }
        });
    },
    
    init: function(){
        
    }
};

CloudCommander.Terminal.Keys = (function(){
    "use strict";
    
    /* loading js and css of CodeMirror */
    CloudCommander.Editor.Terminal.load(this.jqconsole);
    
    var key_event=function(event){

        /* если клавиши можно обрабатывать */
        if(CloudCommander.keyBinded){
            /* if f4 pressed */
            if(event.keyCode===114 &&
                event.altKey){
                    CloudCommander.Terminal.jqconsole.show();
            }
        }
    };
       
    /* добавляем обработчик клавишь */
    if (document.addEventListener)                
        document.addEventListener('keydown', key_event,false);
        
    else        
        document.onkeypress=key_event;
});