/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
//var CloudCommander, Util, DOM, $;
(function(CloudCommander, Util, DOM, $){
    "use strict";
    
    var cloudcmd                    = CloudCommander,
        KeyBinding                  = cloudcmd.KeyBinding,
        MenuSeted                   = false,
        Menu                        = {},
        Position;
        
    Menu.dir                        = '/lib/client/menu/';
    
    /* enable and disable menu constant */
    Menu.ENABLED                    = false;
    
    /* PRIVATE FUNCTIONS */
    
    /** function shows editor
     * @param pReadOnly
     */
    function showEditor(pReadOnly){
        DOM.Images.showLoad();
        var lEditor = cloudcmd[pReadOnly ? 'Viewer' : 'Editor'],
        
            lResult = Util.exec(lEditor, pReadOnly);
        
        if(!lResult){
            lEditor = lEditor.get();
            if(lEditor)
                Util.exec(lEditor.show);
        }
    }
    
    /** 
     * function get menu item object for Upload To
     */
    function getUploadToItem(pObjectName){
        var lObj        = {};
        if( Util.isArray(pObjectName) ){
            
            var n = pObjectName.length;
            for(var i = 0; i < n; i++){
                var lStr = pObjectName[i];
                lObj[lStr] =  getUploadToItem( lStr );
            }
        }
        else if( Util.isString(pObjectName) ){
            lObj.name       = pObjectName;
             
            lObj.callback   = function(key, opt){
                DOM.getCurrentData(function(pParams){
                    var lObject     = cloudcmd[pObjectName];
                    
                    if('init' in lObject)
                        lObject.uploadFile(pParams);
                    else
                        Util.exec(lObject, function(){
                            cloudcmd[pObjectName].uploadFile(pParams);
                        });
                });
            
                Util.log('Uploading to ' + pObjectName+ '...');
            };
        }
        
        return lObj;
    }
       
    /**
     * get menu item
     */
    function getItem(pName, pCallBack){
        var lRet = {
            name : pName
        };
        
        if(Util.isFunction(pCallBack) )
            lRet.callback    = pCallBack;
        
        else if (Util.isObject(pCallBack))
            lRet.items       = pCallBack;
        
        return lRet;
    }
    
    /**
     * get all menu items
     * pItems = [{pName, pFunc}]
     */
     function getAllItems(pItems){
        var lRet = {},
            lName,
            lFunc;
        
        if(pItems)
            for(lName in pItems){
                lFunc = pItems[lName];
                lRet[lName] = getItem(lName, lFunc);
            }
        
        return lRet;
     }
    
    /** 
     * function return configureation for menu
     */
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
            items: getAllItems({
                'View'      : Util.retExec(showEditor, true),
                'Edit'      : Util.retExec(showEditor, false),
                'Delete'    : Util.retExec(DOM.promptRemoveCurrent),
                'Upload to' : getUploadToItem( ['GitHub', 'GDrive', 'DropBox'] ),
                'Download' : function(key, opt){
                        DOM.Images.showLoad();
                        
                        var lPath       = DOM.getCurrentPath(),
                            lId = DOM.getIdBySrc(lPath);
                        
                        Util.log('downloading file ' + lPath +'...');
                        
                        lPath = lPath + '?download';
                        
                        if(!DOM.getById(lId)){
                            var lDownload = DOM.anyload({
                                name        : 'iframe',
                                async       : false,
                                className   : 'hidden',
                                src         : lPath,
                                func        : Util.retFunc(DOM.Images.hideLoad)
                            });
                            
                            DOM.Images.hideLoad();
                            setTimeout(function() {
                                document.body.removeChild(lDownload);
                            }, 10000);
                        }
                        else
                            DOM.Images.showError({
                                responseText: 'Error: You trying to' + 
                                    'download same file to often'});
                    }
            })
        };
    }
    
    /** function loads css and js of Menu
     * @param pCallBack
     */
    function load(pCallBack){
        console.time('menu load');
        
        var lDir    = Menu.dir,
            lFiles  = [
                lDir + 'contextMenu.js',
                lDir + 'contextMenu.css'
            ];
        
        DOM.anyLoadInParallel(lFiles, function(){
            console.timeEnd('menu load');
            $.contextMenu.handle.keyStop = $.noop;
            Util.exec(pCallBack);
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
                    var lLayer = DOM.getById('context-menu-layer');
                    if(lLayer){                                            
                        var lStyle;
                        
                        if(lLayer)
                            lStyle = lLayer.style.cssText;
                        /* hide invisible menu layer */
                        if(lStyle)
                            lLayer.style.cssText = lStyle
                                .replace('z-index: 1', 'z-index:-1');
                        
                        /* get element by point */
                        var lElement    = document.elementFromPoint(pEvent.x, pEvent.y),
                            lTag        = lElement.tagName,
                            lParent;
        
                        if(lTag === 'A' || lTag === 'SPAN'){                
                            if (lElement.tagName === 'A')
                                lParent = lElement.parentElement.parentElement;
                            else if(lElement.tagName === 'SPAN')
                                lParent = lElement.parentElement;
                                
                            if(lParent.className === '')
                                DOM.setCurrentFile(lParent);
                        }
                        
                        /* show invisible menu layer */
                        if(lLayer && lStyle)
                            lLayer.style.cssText = lStyle;
                        
                        /* if document.onclick was set up
                         * before us, it's best time to call it
                         */
                        Util.exec(lFunc_f);
                            
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
        
        DOM.Images.hideLoad();
        
        if(Position && Position.x && Position.y)
            $('li').contextMenu(Position);
        else
            $('li').contextMenu();
    };
    
    /* key binding function */
    Menu.init        = function(pPosition){
        Position = pPosition;
        
        Util.loadOnLoad([
            Menu.show,
            load,
            DOM.jqueryLoad
        ]);
        
        var key_event = function(pEvent){
            var lKEY        = cloudcmd.KEY,
                lKeyCode    = pEvent.keyCode;
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if shift + F10 pressed */
                if(lKeyCode === lKEY.F10 && pEvent.shiftKey){
                    var lCurrent = DOM.getCurrentFile();
                    if(lCurrent)
                        $(lCurrent).contextMenu();
                    
                    pEvent.preventDefault();
                }
            }
            else if (lKeyCode === lKEY.ESC)
                KeyBinding.set();
        };
           
        /* добавляем обработчик клавишь */
        DOM.addKeyListener( key_event );
    };
    
    cloudcmd.Menu                   = Menu;
})(CloudCommander, Util, DOM, $);