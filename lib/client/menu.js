var CloudCommander, CloudFunc, $;
/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
CloudCommander.Menu              = new CloudCommander.Util();

CloudCommander.Menu.dir          = './lib/client/menu/';


    
/* function return configureation
 * for FancyBox open and
 * onclick (it shoud be
 * different objects)
 */
CloudCommander.Menu.getConfig    = (function(){
    return{
        // define which elements trigger this menu
        selector: CloudCommander.CURRENT_FILE,
        // define the elements of the menu
        items: {
            foo: {name: "Foo", callback: function(key, opt){ alert("Foo!"); }},
            bar: {name: "Bar", callback: function(key, opt){ alert("Bar!"); }}
        }
        // there's more, have a look at the demos and docs...
    };
});

/* function loads css and js of FancyBox
 * @pParent     - this
 * @pCallBack   -  executes, when everything loaded
 */
CloudCommander.Menu.load         = (function(pParent, pCallBack){
    return function(){
        var ljsLoad_f = function(){
            var lMenuSrc    = pParent.dir + 'jquery.contextMenu.js';
            var lUISrc      = pParent.dir + 'jquery.ui.position.js';
            
            pParent.jsload(lUISrc);
            
            pParent.jsload(lMenuSrc,{
                onload: pCallBack
            });                                    
        };
        
        var lSrc = pParent.dir +'jquery.contextMenu.css';
        
        pParent.cssLoad({
            src  : lSrc,
            func : {
                onload: ljsLoad_f            
            }   
        });
    }();
});

CloudCommander.Menu.set          = (function(){
    if(!this.seted){
        $.contextMenu(this.getConfig());
        this.seted = true;
    }
});
CloudCommander.Menu.seted        = false;

CloudCommander.Menu.show         = (function(pParent){
    this.set();
    $(CloudCommander.CURRENT_FILE).contextMenu();
});

CloudCommander.Menu.Keys                     = (function(){
    "use strict";
            
    var lCallBack_f = (function(){
        var key_event = (function(){
            return function(event){
                /* если клавиши можно обрабатывать */
                if(CloudCommander.keyBinded)
                    /* if shift + F10 pressed */
                    if(event.keyCode === CloudCommander.KEY.F10 &&
                        event.shiftKey){
                        CloudCommander.Menu.show();
                    
                    event.preventDefault();                    
                    }                
            };
        });
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event(),false);
            
        else{
            var lFunc;
            if(typeof document.onkeydown === 'function')
                lFunc = document.onkeydown;
            
            document.onkeydown = function(){
                if(lFunc)
                    lFunc();
                
                key_event();
            };
        }
        
        /* showing context menu preview*/
        CloudCommander.Menu.show();
    });
        
    CloudCommander.Menu.load(this, lCallBack_f);
});