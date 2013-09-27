/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc){
    'use strict';
    
    CloudCmd.Menu = new MenuProto(CloudCmd, Util, DOM, CloudFunc);
        
    function MenuProto(CloudCmd, Util, DOM, CloudFunc) {
        var Name                        = 'Menu',
            Loading                     = false,
            Key                         = CloudCmd.Key,
            Events                      = DOM.Events,
            MenuSeted                   = false,
            Menu                        = this,
            Position,
            UploadToItemNames;
        
        this.ENABLED                    = false;
        
        this.init        = function(pPosition){
            Loading  = true;
            
            Position = pPosition;
            
            Util.loadOnLoad([
                Menu.show,
                setUploadToItemNames,
                load,
                DOM.jqueryLoad
            ]);
            
            Events.addKey( lListener );
            
            DOM.setButtonKey('f9', function() {
                var lCurrent    = DOM.getCurrentFile();
                
                Events.dispatch('contextmenu', lCurrent);
            });
            
            delete Menu.init;
        };
        
        this.show        = function() {
            if (!Loading) {
                set();
                DOM.Images.hideLoad();
                
                if(Position && !Position.x )
                    Position = undefined;
                
                $('li').contextMenu(Position);
            }
        };
        
        /* function read data from modules.json 
         * and build array of menu items of "upload to"
         * menu
         */
        function setUploadToItemNames(pCallBack) {
            CloudCmd.getModules(function(pModules) {
                var lStorageObj         = Util.findObjByNameInArr( pModules, 'storage' );
                    UploadToItemNames   = Util.getNamesFromObjArray( lStorageObj ) || [];
                
                Util.exec(pCallBack);
            });
        }
        
        
        /** 
         * function get menu item object for Upload To
         */
        function getUploadToItems(pObjectName){
            var i, n, lStr, lObj        = {};
            if (Util.isArray(pObjectName)) {
                
                n = pObjectName.length;
                for(i = 0; i < n; i++){
                    lStr        = pObjectName[i];
                    lObj[lStr]  =  getUploadToItems( lStr );
                }
            }
            else if (Util.isString(pObjectName)) {
                lObj = function(key, opt){
                    DOM.getCurrentData(function(pParams) {
                        CloudCmd.execFromModule(pObjectName, 'uploadFile', pParams);
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
            
            if( Util.isFunction(pCallBack) )
                lRet.callback       = pCallBack;
            
            else if ( Util.isObject(pCallBack) ){
                if(pCallBack.name)
                    lRet.items      = pCallBack;
                else 
                    lRet.items      = getAllItems(pCallBack);
            }
            
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
                    lFunc       = pItems[lName];
                    lRet[lName] = getItem(lName, lFunc);
                }
            
            return lRet;
         }
        
        /**
         * download menu item callback
         */
        function downloadFromMenu(key, opt){
            DOM.Images.showLoad();
            
            var lPath   = DOM.getCurrentPath(),
                lId     = DOM.getIdBySrc(lPath),
                lDir    = DOM.isCurrentIsDir() ? '&&json' : '';
            
            Util.log('downloading file ' + lPath +'...');
            
            lPath = CloudFunc.FS + lPath + '?download' + lDir;
            
            if (!DOM.getById(lId)){
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
        
        /** 
         * function return configureation for menu
         */
        function getConfig (){
            var lRet,
                lMenuItems = {
                    'View'      : Util.retExec(show, 'View'),
                    'Edit'      : Util.retExec(show, 'Edit'),
                    'Rename'    : function(){
                        setTimeout( Util.retExec(DOM.renameCurrent), 100);
                    },
                    'Delete'    : Util.retExec(DOM.promptDeleteSelected),
                    'Zip file'  : DOM.zipFile
                };
            
            if (UploadToItemNames.length)
                lMenuItems['Upload to'] = getUploadToItems(UploadToItemNames);
            
            lMenuItems.Download = Util.retExec(downloadFromMenu);
            
            lMenuItems.New = {
                'File'          : DOM.promptNewFile,
                'Dir'           : DOM.promptNewDir,
                
                'From Filepicker' : function(){
                    CloudCmd.execFromModule('FilePicker', 'saveFile', function(pName, pData){
                        var lPath = DOM.getCurrentDirPath() + pName;
                        
                        DOM.RESTfull.save(lPath,  pData, CloudCmd.refresh);
                    });
                }
            };
            
            lRet = {
                // define which elements trigger this menu
                selector: 'li',
                
                callback: function(key, options) {
                    var m = "clicked: " + key;
                    Util.log(m, options);
                    
                    Key.setBind();
                },
                
                // define the elements of the menu
                items   : getAllItems(lMenuItems),
                events  :{
                    hide: clickProcessing
                }
            };
            
            return lRet;
            
            function show(pName){
                var lEditor = CloudCmd[pName],
                    lResult = Util.exec(lEditor);
                
                if (!lResult)
                    Util.exec(lEditor.show);
            }
        }
        
        /** function loads css and js of Menu
         * @param pCallBack
         */
        function load(pCallBack){
            Util.time(Name + ' load');
            
            var lDir    = '/lib/client/menu/',
                lFiles  = [
                    lDir + 'contextMenu.js',
                    lDir + 'contextMenu.css'
                ];
            
            DOM.anyLoadInParallel(lFiles, function(){
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(pCallBack);
            });
        }
        
        /*
         * Menu works in some crazy way so need a
         * little hack to get every thing work out.
         * When menu shows up, it draws invisible 
         * layer wich hides all elements of
         * Cloud Commander so it could not handle
         * onclick events. To get every thing work
         * how expected we hide invisible layer
         * so for observer it is nothing special
         * is not going on. All magic happening in
         * DOM tree.
         */
        function clickProcessing(){
            var lLayer = DOM.getById('context-menu-layer');
            if(lLayer){
                DOM.hide(lLayer);
                
                var lElement    = document.elementFromPoint(Position.x, Position.y),
                    lTag        = lElement.tagName;
                
                if (Util.strCmp(lTag, ['A', 'SPAN'])) {
                    switch (lTag) {
                        case 'A':
                            lElement = lElement.parentElement.parentElement;
                            break;
                        
                        case 'SPAN':
                            lElement = lElement.parentElement;
                            break;
                    }
                    
                    if (lElement.className === '')
                        DOM.setCurrentFile(lElement);
                }
                
                DOM.show(lLayer);
                Key.setBind();
            }
        }
        
        
        function set(){
            if(!MenuSeted){
                $.contextMenu(getConfig());
                MenuSeted = true;
                DOM.Events.add('mousemove', function(pEvent){
                    Position = {
                        x : pEvent.clientX,
                        y : pEvent.clientY
                    };
                });
            }
        }
        
        function lListener(pEvent){
                var lCurrent,
                    lF9         = Key.F9,
                    lESC        = Key.ESC,
                    lKey        = pEvent.keyCode,
                    lIsBind     = Key.isBind();
                
                if (lIsBind && lKey === lF9) {
                    lCurrent = DOM.getCurrentFile();
                    $(lCurrent).contextmenu();
                    
                    DOM.preventDefault(pEvent);
                }
                else if (lKey === lESC)
                    Key.setBind();
            }
    }
})(CloudCmd, Util, DOM, CloudFunc);
