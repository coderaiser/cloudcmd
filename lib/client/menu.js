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
                
                Images.hide();
                
                $('li').contextMenu(position || Position);
                position = null;
            }
        };
        
        /* function read data from modules.json 
         * and build array of menu items of "upload to"
         * menu
         */
        function setUploadToItemNames(callback) {
            CloudCmd.getModules(function(pModules) {
                var lStorageObj         = Util.findObjByNameInArr( pModules, 'storage' );
                    UploadToItemNames   = Util.getNamesFromObjArray( lStorageObj ) || [];
                
                Util.exec(callback);
            });
        }
        
        /** 
         * function get menu item object for Upload To
         */
        function getUploadToItems(items) {
            var str, func,
                type    = Util.getType(name),
                obj     = {};
            
            switch(type) {
            case 'array':
                items.forEach(function(item) {
                    str         = item;
                    obj[str]    =  getUploadToItems(str);
                });
                break;
            
            case 'string':
                func = function() {
                    Info.getData(function(data) {
                        var name = Info.name;
                        
                        CloudCmd.execFromModule(items, 'uploadFile', {
                            name: name,
                            data: data
                        });
                    });
                    
                    Util.log('Uploading to ' + name + '...');
                };
                break;
            }
            
            return func || obj;
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
            var element,
                TIME    = 1000,
                date    = Date.now(),
                path    = Info.path,
                id      = DOM.getIdBySrc(path),
                dir     = Info.isDir ? '&&json' : '';
            
            Util.log('downloading file ' + path +'...');
            
            path        = CloudFunc.FS + path + '?download' + dir;
            
            element     = DOM.anyload({
                id          : id + '-' + date,
                name        : 'iframe',
                async       : false,
                className   : 'hidden',
                src         : path,
            });
            
            setTimeout(function() {
                document.body.removeChild(element);
            }, TIME);
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
         * @param callback
         */
        function load(callback) {
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
                Util.exec(callback);
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
