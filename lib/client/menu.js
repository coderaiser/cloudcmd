/* object contains jQuery-contextMenu
 * https://github.com/medialize/jQuery-contextMenu
 */
var CloudCmd, Util, DOM, CloudFunc, $;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Menu = MenuProto;
        
    function MenuProto(position) {
        var Name                        = 'Menu',
            Info                        = DOM.CurrentInfo,
            Loading                     = false,
            Key                         = CloudCmd.Key,
            Events                      = DOM.Events,
            MenuSeted                   = false,
            Menu                        = this,
            Position                    = CloudCmd.MousePosition,
            Images                      = DOM.Images,
            UploadToItemNames;
        
        this.ENABLED                    = false;
        
        function init() {
            Loading  = true;
            
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
                if (!MenuSeted) {
                    $.contextMenu(getConfig());
                    MenuSeted = true;
                }
                
                Images.hideLoad();
                
                $('li').contextMenu(position || Position);
                position = null;
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
                lObj = function() {
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
        function getItem(name, callback) {
            var ret,
                icon    = Util.convertName(name);
            
            ret        = {
                name : name,
                icon : icon
            };
            
            if (Util.isFunction(callback))
                ret.callback       = callback;
            
            else if (Util.isObject(callback))
                if (callback.name)
                    ret.items      = callback;
                else 
                    ret.items      = getAllItems(callback);
            
            return ret;
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
        function downloadFromMenu() {
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
            var ret,
                show = function(name) {
                    var module  = CloudCmd[name],
                        ret     = Util.exec(module);
                    
                    if (!ret)
                        Util.exec(module.show);
                },
                menuItems = {
                    'View'          : Util.bind(show, 'View'),
                    'Edit'          : Util.bind(show, 'Edit'),
                    'Rename'        : function() {
                        setTimeout(DOM.renameCurrent, 100);
                    },
                    'Delete'        : DOM.promptDelete,
                    '(Un)Select All': DOM.toggleAllSelectedFiles,
                    'Zip file'      : DOM.zipFile,
                    'Unzip file'    : DOM.unzipFile
                };
            
            if (UploadToItemNames.length)
                menuItems['Upload to'] = getUploadToItems(UploadToItemNames);
            
            menuItems.Download = downloadFromMenu;
            
            menuItems.New = {
                'File'              : DOM.promptNewFile,
                'Directory'         : DOM.promptNewDir,
                
                'From FilePicker'   : function() {
                    Images.showLoad({
                        top: true
                    });
                    
                    CloudCmd.execFromModule('FilePicker', 'saveFile', function(name, data) {
                        var path = DOM.getCurrentDirPath() + name;
                        
                        DOM.RESTful.write(path,  data, CloudCmd.refresh);
                    });
                }
            };
            
            ret = {
                // define which elements trigger this menu
                selector: 'li',
                
                // define the elements of the menu
                items   : getAllItems(menuItems),
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
            
            return ret;
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
        
        function clickProcessing() {
            var element, isCurrent, parent, name,
                layer           = DOM.getById('context-menu-layer');
            
            if (layer) {
                DOM.hide(layer);
                
                element             = DOM.getCurrentByPosition(Position);
                if (element) {
                    parent          = element.parentElement;
                    name            = parent && parent.getAttribute('data-name');
                
                    if (name === 'js-files') {
                        isCurrent   = DOM.isCurrentFile(element);
                        
                        if (!isCurrent)
                            DOM.setCurrentFile(element);
                    }
                }
            }
            
            Key.setBind();
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
