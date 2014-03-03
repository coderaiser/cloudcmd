/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Menu = MenuProto;
        
    function MenuProto(pPosition) {
        var Name                        = 'Menu',
            Info                        = DOM.CurrentInfo,
            Loading                     = false,
            Key                         = CloudCmd.Key,
            Events                      = DOM.Events,
            MenuSeted                   = false,
            Menu                        = this,
            Position,
            Images                      = DOM.Images,
            UploadToItemNames;
        
        this.ENABLED                    = false;
        
        function init() {
            Loading  = true;
            
            Position = pPosition;
            
            Util.loadOnLoad([
                DOM.jqueryLoad,
                load,
                setUploadToItemNames,
                Menu.show
            ]);
            
            Events.addKey(listener);
        }
        
        this.show        = function() {
            Key.unsetBind();
            
            if (!Loading) {
                set();
                Images.hideLoad();
                
                if (Position && !Position.x )
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
        function getUploadToItems(pObjectName) {
            var i, n, lStr, lObj        = {};
            if (Util.isArray(pObjectName)) {
                
                n = pObjectName.length;
                for (i = 0; i < n; i++) {
                    lStr        = pObjectName[i];
                    lObj[lStr]  =  getUploadToItems( lStr );
                }
            }
            else if (Util.isString(pObjectName)) {
                lObj = function(key, opt) {
                    Info.getData(function(data) {
                        var name = Info.name;
                        CloudCmd.execFromModule(pObjectName, 'uploadFile', {
                            name: name,
                            data: data
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
        function getItem(pName, pCallBack) {
            var lRet,
                name    = pName,
                icon    = name && name.toLowerCase();
            
            icon        = Util.removeStr(icon, ['(', ')']);
            icon        = Util.replaceStr(icon, ' ', '-');
            
            lRet        = {
                name : pName,
                icon : icon
            };
            
            if (Util.isFunction(pCallBack))
                lRet.callback       = pCallBack;
            
            else if (Util.isObject(pCallBack))
                if (pCallBack.name)
                    lRet.items      = pCallBack;
                else 
                    lRet.items      = getAllItems(pCallBack);
            
            return lRet;
        }
        
        /**
         * get all menu items
         * pItems = [{pName, pFunc}]
         */
         function getAllItems(pItems) {
            var lRet = {},
                lName,
                lFunc;
            
            if (pItems)
                for (lName in pItems) {
                    lFunc       = pItems[lName];
                    lRet[lName] = getItem(lName, lFunc);
                }
            
            return lRet;
         }
        
        /**
         * download menu item callback
         */
        function downloadFromMenu(key, opt) {
            Images.showLoad();
            
            var TIME    = 1000,
                lPath   = Info.path,
                lId     = DOM.getIdBySrc(lPath),
                lDir    = Info.isDir ? '&&json' : '';
            
            Util.log('downloading file ' + lPath +'...');
            
            lPath = CloudFunc.FS + lPath + '?download' + lDir;
            
            if (!DOM.getById(lId)) {
                var lDownload = DOM.anyload({
                    name        : 'iframe',
                    async       : false,
                    className   : 'hidden',
                    src         : lPath,
                    func        : Images.hideLoad
                });
                
                Images.hideLoad();
                setTimeout(function() {
                    document.body.removeChild(lDownload);
                }, TIME);
            }
            else
                Images.showError({
                    responseText: 'Error: You trying to' + 
                        'download same file to often'});
        }
        
        /** 
         * function return configureation for menu
         */
        function getConfig () {
            var lRet,
                lMenuItems = {
                    'View'          : show.bind(null, 'View'),
                    'Edit'          : show.bind(null, 'Edit'),
                    'Rename'        : function() {
                        setTimeout(DOM.renameCurrent, 100);
                    },
                    'Delete'        : DOM.promptDeleteSelected,
                    '(Un)Select All': DOM.toggleAllSelectedFiles,
                    'Zip file'      : DOM.zipFile
                };
            
            if (UploadToItemNames.length)
                lMenuItems['Upload to'] = getUploadToItems(UploadToItemNames);
            
            lMenuItems.Download = downloadFromMenu;
            
            lMenuItems.New = {
                'File'              : DOM.promptNewFile,
                'Directory'         : DOM.promptNewDir,
                
                'From FilePicker'   : function() {
                    Images.showLoad({
                        top: true
                    });
                    
                    CloudCmd.execFromModule('FilePicker', 'saveFile', function(pName, pData) {
                        var lPath = DOM.getCurrentDirPath() + pName;
                        
                        DOM.RESTful.save(lPath,  pData, CloudCmd.refresh);
                    });
                }
            };
            
            lRet = {
                // define which elements trigger this menu
                selector: 'li',
                
                // define the elements of the menu
                items   : getAllItems(lMenuItems),
                events  :{
                    hide: function() {
                        var event = window.event;
                        
                        if (!event || !event.keyCode)
                            clickProcessing();
                        else if (event.keyCode)
                            listener(event);
                    }
                }
            };
            
            return lRet;
            
            function show(pName) {
                var lEditor = CloudCmd[pName],
                    lResult = Util.exec(lEditor);
                
                if (!lResult)
                    Util.exec(lEditor.show);
            }
        }
        
        /** function loads css and js of Menu
         * @param pCallBack
         */
        function load(pCallBack) {
            Util.time(Name + ' load');
            
            var dir     = CloudCmd.LIBDIRCLIENT + 'menu/',
                files   = [
                    dir + 'contextMenu.js',
                    dir + 'contextMenu.css'
                ];
            
            DOM.anyLoadInParallel(files, function() {
                setCSS();
                Util.timeEnd(Name + ' load');
                Loading = false;
                Util.exec(pCallBack);
            });
        }
        
        function setCSS() {
            DOM.cssSet({
                id   : 'menu-css',
                inner: '.context-menu-item.icon-edit {'     +
                            'background-image: none;'       +
                        '}'                                 +
                        '.context-menu-item.icon-delete {'  +
                            'background-image: none;'       +
                        '}'
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
        function clickProcessing() {
            var lLayer = DOM.getById('context-menu-layer');
            
            if (lLayer && Position) {
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
        
        
        function set() {
            if (!MenuSeted) {
                $.contextMenu(getConfig());
                MenuSeted = true;
                DOM.Events.add('mousemove', function(pEvent) {
                    Position = {
                        x : pEvent.clientX,
                        y : pEvent.clientY
                    };
                });
            }
        }
        
        function listener(event) {
            var current,
                F9          = Key.F9,
                ESC         = Key.ESC,
                key         = event.keyCode,
                isBind      = Key.isBind();
            
            if (isBind && key === F9) {
                current = DOM.getCurrentFile();
                $(current).contextmenu();
                
                DOM.preventDefault(event);
            }  else if (key === ESC)
                    Key.setBind();
        }
        
        init();
    }
})(CloudCmd, Util, DOM, CloudFunc);
