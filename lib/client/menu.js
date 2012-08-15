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
        
        var lThis = this;

        var lFunc_f = document.onclick;
        /*
         * Menu works in some crazy way so need a
         * little hack to get every thing work out.
         * When menu shows up, it drawing invisible 
         * layer wich hides all elements of
         * Cloud Commander so it could not handle
         * onclick events. To get every thing work
         * how expected we hide out invisible layer
         * so for observer it is nothing special
         * is not going on. All magic happening in
         * DOM tree
         */
        document.onclick = function(pEvent){
            if(pEvent.x && pEvent.y){
                var lLayer = lThis.getById('context-menu-layer')
                var lStyle;
                
                if(lLayer)
                    lStyle = lLayer.style.cssText;
                /* hide invisible menu layer */
                if(lStyle)
                    lLayer.style.cssText = lStyle
                        .replace('z-index: 1', 'z-index:-1')
                
                /* get element by point */
                var lElement = document.elementFromPoint(pEvent.x, pEvent.y)
                if (lElement.tagName === 'A')
                    lThis.setCurrentFile(lElement
                        .parentElement.parentElement);
                else if(lElement.tagName === 'SPAN')
                    lThis.setCurrentFile(lElement
                        .parentElement);
                
                /* show invisible menu layer */
                if(lLayer && lStyle)
                    lLayer.style.cssText = lStyle;
                
                /* if document.onclick was set up
                 * before us, it's best time to call it
                 */
                if(typeof lFunc_f === 'function')
                    lFunc_f();
            }
        }
        
        this.seted = true;
    }
});
CloudCommander.Menu.seted        = false;

CloudCommander.Menu.show         = (function(pParent, pPosition){
    return function(){
        pParent.set();
        
        if(pPosition && pPosition.x && pPosition.y)
            $('li').contextMenu(pPosition)
        else
            $('li').contextMenu();
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
    
    CloudCommander.Menu.load(this, pPosition);
});