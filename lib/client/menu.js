/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
var CloudCommander, $;
(function(){
    "use strict";
    
    var cloudcmd                    = CloudCommander,
        KeyBinding                  = cloudcmd.KeyBinding,
        Util                        = cloudcmd.Util,
        MenuSeted                   = false,
        Menu                        = {},
        Position;
        
    Menu.dir         = './lib/client/menu/';
    
    /* enable and disable menu constant */
    Menu.ENABLED                  = false;
    
    /* PRIVATE FUNCTIONS */
    
    /** function shows editor
     * @param pReadOnly
     */
    function showEditor(pReadOnly){
        Util.Images.showLoad();
        var lEditor = pReadOnly ? cloudcmd.Viewer : cloudcmd.Editor;

        if( Util.isFunction(lEditor) )
            lEditor(pReadOnly);
        else{
            lEditor = lEditor.get();
            if(lEditor && lEditor.show)
                lEditor.show();
        }
    }
    
    /** function return configureation for menu */
    function getConfig (){
        return{
            // define which elements trigger this menu
            selector: 'li',
            
            callback: function(key, options) {
                var m = "clicked: " + key;
                console.log(m, options);
                
                KeyBinding.set();
            },
            // define the elements of the menu
            items: {
                view: {name: 'View', callback: function(key, opt){
                   showEditor(true);
                }},
                
                edit: {name: 'Edit', callback: function(key, opt){
                    showEditor();
                }},
                
                'delete': {name: 'Delete',
                    callback: function(key, opt){
                        console.log('delete menu item choosen');
                }},
                
                download: {name: 'Download',callback: function(key, opt){
                    Util.Images.showLoad();
                    
                    var lCurrent    = Util.getCurrentFile();
                    var lLink       = Util.getByTag('a', lCurrent)[0].href;                
                    
                    console.log('downloading file ' + lLink +'...');
                    
                    lLink = lLink + '?download';                
                    var lId = Util.getIdBySrc(lLink);
                    
                    if(!Util.getById(lId)){
                        var lDownload = Util.anyload({
                            name        : 'iframe',
                            async       : false,
                            className   : 'hidden',
                            src         : lLink,
                            func        : function(){
                                Util.Images.hideLoad();
                            }
                        });
                        
                        Util.Images.hideLoad();
                        setTimeout(function() {
                            document.body.removeChild(lDownload);
                        }, 10000);
                    }
                    else                    
                        Util.Images.showError({
                            responseText: 'Error: You trying to' + 
                                'download same file to often'});
                }}
            }
        };
    }
    
    /** function loads css and js of Menu
     * @param pParent     - this
     * @param pPosition   -  position of menu
     */
    function load(){
        console.time('menu load');

        var lDir = Menu.dir;
        
        Util.anyLoadOnload([
            lDir + 'contextMenu.js',
            lDir + 'contextMenu.css'],
            function(){
                console.timeEnd('menu load');
                Menu.show();
            });
    }
    
    function set(){
        if(!MenuSeted){
            $.contextMenu(getConfig());
                
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
                if(pEvent && pEvent.x && pEvent.y){
                    var lLayer = Util.getById('context-menu-layer');
                    if(lLayer){                                            
                        var lStyle;
                        
                        if(lLayer)
                            lStyle = lLayer.style.cssText;
                        /* hide invisible menu layer */
                        if(lStyle)
                            lLayer.style.cssText = lStyle
                                .replace('z-index: 1', 'z-index:-1');
                        
                        /* get element by point */
                        var lElement = document.elementFromPoint(pEvent.x, pEvent.y);
                        var lTag = lElement.tagName;
                        var lParent;
        
                        if(lTag === 'A' || lTag === 'SPAN'){                
                            if (lElement.tagName === 'A')
                                lParent = lElement.parentElement.parentElement;
                            else if(lElement.tagName === 'SPAN')
                                lParent = lElement.parentElement;
                                
                            if(lParent.className === '')
                                Util.setCurrentFile(lParent);
                        }
                        
                        /* show invisible menu layer */
                        if(lLayer && lStyle)
                            lLayer.style.cssText = lStyle;
                        
                        /* if document.onclick was set up
                         * before us, it's best time to call it
                         */
                        if(typeof lFunc_f === 'function')
                            lFunc_f();
                            
                        KeyBinding.set();
                    }
                }
            };
            
            MenuSeted = true;
        }
    }
    
    
    /** function shows menu for the first time
     * right away after loading
     */
    Menu.show        = function(){
        set();
        
        Util.Images.hideLoad();
        
        if(Position && Position.x && Position.y)
            $('li').contextMenu(Position);            
        else
            $('li').contextMenu();
    };
    
    /* key binding function */
    Menu.Keys        = function(pPosition){
        Position = pPosition;
        
        var lFunc = document.oncontextmenu;        
        document.oncontextmenu = function(){
            if(typeof lFunc === 'function')
                lFunc();
            return Menu.ENABLED;
        };
        
        var key_event = (function(pEvent){
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() )
                /* if shift + F10 pressed */
                if(pEvent.keyCode === cloudcmd.KEY.F10 &&
                    pEvent.shiftKey){
                        var lCurrent = Util.getCurrentFile();
                        if(lCurrent)
                            $(lCurrent).contextMenu();
                
                pEvent.preventDefault();                    
            }
        });
           
        /* добавляем обработчик клавишь */
        if (document.addEventListener)                
            document.addEventListener('keydown', key_event.bind(this),false);
            
        else{
            lFunc;
            if(typeof document.onkeydown === 'function')
                lFunc = document.onkeydown;
            
            document.onkeydown = function(){
                if(lFunc)
                    lFunc();
                
                key_event();
            };
            
            /* showing context menu preview*/
            Menu.show();
        }
        
        Util.jqueryLoad( load );
    };
    
    cloudcmd.Menu                   = Menu;
})();