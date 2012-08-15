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
        selector: 'li',
        // define the elements of the menu
        items: {
            view: {name: "View", callback: function(key, opt){
                if(typeof CloudCommander.Viewer === 'function')
                    CloudCommander.Viewer();
                else{
                    var lViewer = CloudCommander.Viewer.get();
                    if(lViewer && lViewer.show)
                        lViewer.show()
                }
            }},
            edit: {name: "Edit", callback: function(key, opt){
                if(typeof CloudCommander.Editor === 'function')
                    CloudCommander.Editor();
                else{
                    var lEditor = CloudCommander.Editor.get();
                    if(lEditor && lEditor.show)
                        lEditor.show()
                }
                
            }}
        }
        // there's more, have a look at the demos and docs...
    };
});

/* function loads css and js of Menu
 * @pParent     - this
 * @pPosition   -  position of menu
 */
CloudCommander.Menu.load         = (function(pParent, pPosition){
    return function(){
        var ljsLoad_f = function(){
            var lUISrc      = pParent.dir + 'jquery.ui.position.js';
            var lMenuSrc    = pParent.dir + 'jquery.contextMenu.js';            
            
            pParent.jsload(lUISrc, function(){
                pParent.jsload(lMenuSrc, pParent.show(pParent, pPosition));
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

CloudCommander.Menu.show         = (function(pParent, pPosition){
    return function(){
        pParent.set();
        
        $('li').contextMenu(pPosition ?
            (pPosition.x, pPosition.y) : () );
    }
});

CloudCommander.Menu.Keys                     = (function(pPosition){
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
            
    var lThis = this;
    document.onmousedown = function(){
        var lTag = event.target.nodeName;
        if(event.button === CloudCommander.MOUSE_BUTTON.RIGHT)
            if(lTag === 'SPAN')
                lThis.setCurrentFile(event.target.parentElement)
            else if(lTag === 'A')
                lThis.setCurrentFile(event.target.parentElement.parentElement)
            
            CloudCommander.Menu.show();
    };
    
    CloudCommander.Menu.load(this, pPosition);
});