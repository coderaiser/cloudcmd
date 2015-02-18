var CloudCmd, Util, DOM, CloudFunc, MenuIO;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Menu = MenuProto;
        
    function MenuProto(position) {
        var Buffer                      = DOM.Buffer,
            Info                        = DOM.CurrentInfo,
            Loading                     = true,
            Key                         = CloudCmd.Key,
            Events                      = DOM.Events,
            Menu                        = this,
            Images                      = DOM.Images,
            MenuShowedName,
            MenuContext,
            MenuContextFile,
            Position                    = CloudCmd.MousePosition;
        
        this.ENABLED                    = false;
        
        function init() {
            Loading  = true;
            Menu.show();
            
            Events.addKey(listener);
        }
        
        this.hide   = function() {
            MenuContext.hide();
            MenuContextFile.hide();
        };
        
        this.show   = function(position) {
            var x, y,
                showFunc;
                
            if (position) {
                x   = position.x;
                y   = position.y;
            }
            
            showFunc    = function() {
                show(x, y);
                Images.hide();
            };
            
            Util.exec.if(MenuIO, showFunc, function() {
                DOM.loadMenu(function(error) {
                    if (error)
                        DOM.Dialog.alert(error);
                    else
                        showFunc();
                });
            });
        };
        
        function show(x, y) {
            if (!x || !y) {
                x = (position || Position).x;
                y = (position || Position).y;
            }
            
            if (!Loading) {
                MenuContext.show(x, y);
                MenuContextFile.show(x, y);
            } else {
                loadFileMenuData(function(menuDataFile) {
                    var is, menu,
                        NOT_FILE        = true,
                        fm              = DOM.getFM(),
                        menuData        = getMenuData(),
                        options         = getOptions(NOT_FILE),
                        optionsFile     = getOptions();
                    
                    MenuContext         = new MenuIO(fm, options, menuData);
                    MenuContextFile     = new MenuIO(fm, optionsFile, menuDataFile);
                    is                  = DOM.getCurrentByPosition({
                        x: x,
                        y: y
                    });
                    
                    if (is)
                        menu    = MenuContextFile;
                    else
                        menu    = MenuContext;
                    
                    menu.show(x, y);
                    
                    Loading             = false;
                    position            = null;
                });
            }
        }
        
        function getOptions(notFile) {
            var name, func, options;
            
            if (notFile) {
                name    = 'context';
                func    = Key.unsetBind;
            } else {
                name    = 'contextFile';
            }
                
            options     = {
                icon        : true,
                beforeClose : Key.setBind,
                beforeShow  : Util.exec.with(beforeShow, func),
                beforeClick : beforeClick,
                name        : name,
            };
            
            return options;
        }
        
        function getMenuData() {
            var menu = {
                'Paste'         : Buffer.paste,
                'New'           : {
                     'File'             : DOM.promptNewFile,
                     'Directory'        : DOM.promptNewDir,
                     'From Cloud'       : getFromPicker,
                },
                '(Un)Select All': DOM.toggleAllSelectedFiles
            };
            
            return menu;
        }
        
        function loadFileMenuData(callback) {
            getUploadTo(function(menuUpload) {
                var show        = function(name) {
                        CloudCmd[name].show();
                    },
                    menuData    = getMenuData(),
                    menu        = {
                        'View'          : Util.exec.with(show, 'View'),
                        'Edit'          : Util.exec.with(show, 'Edit'),
                        'Rename'        : function() {
                            setTimeout(DOM.renameCurrent, 100);
                        },
                        'Delete'        : DOM.promptDelete,
                        'Pack'          : getActiveFunc(DOM.pack),
                        'Unpack'        : getActiveFunc(DOM.unpack),
                        'Upload'        : function() {
                            CloudCmd.Upload.show();
                        },
                        'Upload To'     : {},
                        'Download'      : download,
                        'Cut'           : Buffer.cut,
                        'Copy'          : Buffer.copy,
                };
                
                menu['Upload To'] = menuUpload;
                
                Util.copyObj(menu, menuData);
                
                Util.exec(callback, menu);
            });
        }
        
        function beforeShow(callback, params) {
            var name    = params.name,
                notShow = DOM.getCurrentByPosition({
                    x: params.x,
                    y: params.y
                });
            
            if (params.name === 'contextFile') {
                notShow   = !notShow;
            }
            
            if (!notShow)
                MenuShowedName = name;
            
            Util.exec(callback);
            
            return notShow;
        }
        
        function beforeClick(name) {
            var notCall;
            
            if (MenuShowedName !== name)
                notCall = true;
            
            return notCall;
        }
        
        function getUploadTo(callback) {
            DOM.Files.get('modules', function(error, modules) {
                var menu    = {},
                    storage = Util.findObjByNameInArr(modules, 'storage'),
                    items   = Util.getNamesFromObjArray(storage) || [];
                    
                items.forEach(function(name) {
                    menu[name] = Util.exec.with(uploadTo, name);
                });
                
                callback(menu);
            });
        }
        
        function uploadTo(nameModule) {
            Info.getData(function(error, data) {
                var name = Info.name;
                 
                CloudCmd.execFromModule(nameModule, 'uploadFile', {
                    name: name,
                    data: data
                });
            });
            
            CloudCmd.log('Uploading to ' + name + '...');
        }
        
        function getFromPicker() {
            Images.show.load('top');
            
            CloudCmd.execFromModule('FilePicker', 'saveFile', function(name, data) {
                var path = DOM.getCurrentDirPath() + name;
                
                DOM.RESTful.write(path,  data, CloudCmd.refresh);
            });
        }
        
        function download() {
            var TIME        = 1000,
                apiURL      = CloudFunc.apiURL,
                FS          = CloudFunc.FS,
                date        = Date.now(),
                files       = DOM.getActiveFiles();
            
            files.forEach(function(file) {
                var element,
                    selected    = DOM.isSelected(file),
                    path        = DOM.getCurrentPath(file),
                    id          = DOM.load.getIdBySrc(path),
                    isDir       = DOM.isCurrentIsDir(file),
                    dir         = isDir ? '&&json' : '';
                
                CloudCmd.log('downloading file ' + path + '...');
                
                path        = apiURL + FS + path + '?download' + dir;
                
                element     = DOM.load({
                    id          : id + '-' + date,
                    name        : 'iframe',
                    async       : false,
                    className   : 'hidden',
                    src         : path
                });
                
                setTimeout(function() {
                    document.body.removeChild(element);
                }, TIME);
                
                if (selected)
                    DOM.toggleSelectedFile(file);
            });
        }
        
        function getActiveFunc(callback) {
            return function() {
                DOM.getActiveFiles().forEach(callback);
            };
        }
        
        function listener(event) {
            var current, x, y, position,
                F9          = Key.F9,
                ESC         = Key.ESC,
                key         = event.keyCode,
                isBind      = Key.isBind();
            
            if (isBind && key === F9) {
                current     = Info.element;
                position    = current.getBoundingClientRect();
                
                x           = position.left + position.width / 3;
                y           = position.top;
                
                MenuContext.show(x, y);
                
                event.preventDefault();
            }  else if (key === ESC) {
                    Menu.hide();
            }
        }
        
        init();
    }
})(CloudCmd, Util, DOM, CloudFunc);
