/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
var CloudCommander, Util, DOM, CloudFunc, $;
(function(){
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
                
                delete: {name: 'Delete',
                    callback: function(key, opt){
                        DOM.delete();
                }},
                
                upload: {
                    name: "Upload",
                    items: {
                        'upload_to_gist': {name: 'to Gist',
                            callback: function(key, opt){
                                var lCurrent    = DOM.getCurrentFile(), 
                                    lA          = DOM.getCurrentLink(lCurrent).href,
                                    lName       = DOM.getCurrentName(lCurrent);
                                /* убираем адрес хоста*/
                                lA = Util.removeStr(lA, cloudcmd.HOST);
                                lA = Util.removeStr(lA, CloudFunc.NOJS);
                                
                                DOM.ajax({
                                    url     : lA,
                                    error   : DOM.Images.showError,
                                    success : function(data, textStatus, jqXHR){
                                        if( Util.isObject(data) )
                                            data = JSON.stringify(data, null, 4);
                                        
                                        var lGitHub = cloudcmd.GitHub;
                                        
                                        if('init' in lGitHub)
                                            lGitHub.createGist(data, lName);
                                        else
                                            Util.exec(cloudcmd.GitHub,
                                                function(){
                                                    lGitHub.createGist(data, lName);
                                                });
                                    }
                                });
                                    
                                Util.log('Uploading to gist...');
                            }
                        },
                    },
                },
                download: {name: 'Download',callback: function(key, opt){
                    DOM.Images.showLoad();
                    
                    var lCurrent    = DOM.getCurrentFile(),
                        lLink       = DOM.getByTag('a', lCurrent)[0].href;
                    
                    console.log('downloading file ' + lLink +'...');
                    
                    lLink = lLink + '?download';
                                        
                    lLink = Util.removeStr( lLink, CloudFunc.NOJS );
                    var lId = DOM.getIdBySrc(lLink);
                    
                    if(!DOM.getById(lId)){
                        var lDownload = DOM.anyload({
                            name        : 'iframe',
                            async       : false,
                            className   : 'hidden',
                            src         : lLink,
                            func        : function(){
                                DOM.Images.hideLoad();
                            }
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
                }}
            }
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
        
        DOM.Images.hideLoad();
        
        if(Position && Position.x && Position.y)
            $('li').contextMenu(Position);            
        else
            $('li').contextMenu();
    };
    
    /* key binding function */
    Menu.init        = function(pPosition){
        Position = pPosition;
        
        DOM.jqueryLoad( Util.retLoadOnLoad([
            Menu.show,
            load
        ]));
        
        var key_event = function(pEvent){
            /* если клавиши можно обрабатывать */
            if( KeyBinding.get() ){
                /* if shift + F10 pressed */
                if(pEvent.keyCode === cloudcmd.KEY.F10 && pEvent.shiftKey){
                    var lCurrent = DOM.getCurrentFile();
                    if(lCurrent)
                        $(lCurrent).contextMenu();                
                    
                    pEvent.preventDefault();
                }
            }
            else if (pEvent.keyCode === cloudcmd.KEY.ESC)
                KeyBinding.set();
        };
           
        /* добавляем обработчик клавишь */
        DOM.addKeyListener( key_event );
    };
    
    cloudcmd.Menu                   = Menu;
})();