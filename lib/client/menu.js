var CloudCmd, Util, DOM, CloudFunc, MenuIO;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Menu = MenuProto;
        
    function MenuProto(position) {
        var Buffer              = DOM.Buffer,
            Info                = DOM.CurrentInfo,
            Loading             = true,
            Key                 = CloudCmd.Key,
            Events              = DOM.Events,
            Dialog              = DOM.Dialog,
            Images              = DOM.Images,
            Menu                = this,
            TITLE               = 'Menu',
            
            MenuShowedName,
            MenuContext,
            MenuContextFile;
        
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
                        Dialog.alert(TITLE, error);
                    else
                        showFunc();
                });
            });
        };
        
        function show(x, y) {
            var pos;
            
            if (!x || !y) {
                if (position) {
                    x = position.x;
                    y = position.y;
                } else {
                    pos = getCurrentPosition();
                    
                    x = pos.x;
                    y = pos.y;
                }
            }
            
            if (!Loading) {
                MenuContext.show(x, y);
                MenuContextFile.show(x, y);
            } else {
                loadFileMenuData(function(isAuth, menuDataFile) {
                    var is, menu,
                        NOT_FILE        = true,
                        fm              = DOM.getFM(),
                        menuData        = getMenuData(isAuth),
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
        
        function isAuth(callback) {
            DOM.Files.get('config', function(error, config) {
                var is = config.auth;
                
                if (error)
                    DOM.alert(TITLE, error);
                
                callback(is);
            });
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
        
        function getMenuData(isAuth) {
            var menu = {
                'Paste'         : Buffer.paste,
                'New'           : {
                     'File'             : DOM.promptNewFile,
                     'Directory'        : DOM.promptNewDir
                },
                'Upload'        : function() {
                    CloudCmd.Upload.show();
                },
                'Upload From Cloud': uploadFromCloud,
                '(Un)Select All': DOM.toggleAllSelectedFiles
            };
            
            if (isAuth)
                menu['Log Out'] = CloudCmd.logOut;
            
            return menu;
        }
        
        function curry(fn) {
            var args = [].slice.call(arguments, 1);
            
            return function() {
                fn.apply(null, args.concat(arguments));
            };
        }
        
        function loadFileMenuData(callback) {
            isAuth(function(is) {
                var show        = function(name) {
                        CloudCmd[name].show();
                    },
                    Dialog      = DOM.Dialog,
                    menuData    = getMenuData(is),
                    menu        = {
                        'View'          : curry(show, 'View'),
                        'Edit'          : curry(show, 'Edit'),
                        'Rename'        : function() {
                            setTimeout(DOM.renameCurrent, 100);
                        },
                        'Delete'        : function() {
                            CloudCmd.Operation.show('delete');
                        },
                        'Pack'          : function() {
                            CloudCmd.Operation.show('pack');
                        },
                        'Extract'       : function() {
                            CloudCmd.Operation.show('extract');
                        },
                        'Download'      : download,
                        'Upload To Cloud': curry(uploadTo, 'Cloud'),
                        'Cut'           : function() {
                            isCurrent(Buffer.cut, function() {
                                Dialog.alert.noFiles(TITLE);
                            });
                        },
                        'Copy'          : function() {
                            isCurrent(Buffer.copy, function() {
                                Dialog.alert.noFiles(TITLE);
                            });
                        },
                };
                
                Util.copyObj(menu, menuData);
                
                callback(is, menu);
            });
        }
        
        function isCurrent(yesFn, noFn) {
            if (Info.name !== '..')
                yesFn();
            else
                noFn();
        }
        
        function isPath(x, y) {
            var el, elements, is,
                panel       = Info.panel;
            
            if (panel) {
                el          = document.elementFromPoint(x, y),
                elements    = panel.querySelectorAll('[data-name="js-path"] *'),
                is          = ~[].indexOf.call(elements, el);
            }
            
            return is;
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
            
            if (!notShow)
                notShow = isPath(params.x, params.y);
            
            return notShow;
        }
        
        function beforeClick(name) {
            var notCall;
            
            if (MenuShowedName !== name)
                notCall = true;
            
            return notCall;
        }
        
        function uploadTo(nameModule) {
            Info.getData(function(error, data) {
                var name        = Info.name,
                    execFrom    = CloudCmd.execFromModule;
                 
                execFrom(nameModule, 'uploadFile', name, data);
            });
            
            CloudCmd.log('Uploading to ' + name + '...');
        }
        
        function uploadFromCloud() {
            Images.show.load('top');
            
            CloudCmd.execFromModule('Cloud', 'saveFile', function(name, data) {
                var path = DOM.getCurrentDirPath() + name;
                
                DOM.RESTful.write(path,  data, function(error) {
                    !error && CloudCmd.refresh();
                });
            });
        }
        
        function download() {
            var TIME        = 30 * 1000,
                prefixUr    = CloudCmd.PREFIX_URL,
                FS          = CloudFunc.FS,
                PACK        = '/pack',
                date        = Date.now(),
                files       = DOM.getActiveFiles();
            
            if (!files.length)
                DOM.Dialog.alert.noFiles();
            else
                files.forEach(function(file) {
                    var element,
                        selected    = DOM.isSelected(file),
                        path        = DOM.getCurrentPath(file),
                        id          = DOM.load.getIdBySrc(path),
                        isDir       = DOM.isCurrentIsDir(file);
                    
                    CloudCmd.log('downloading file ' + path + '...');
                    
                     /*
                      * if we send ajax request -
                      * no need in hash so we escape #
                      * and all other characters, like "%"
                      */
                    path = path.replace(/#/g, '%23');
                    path = encodeURI(path);
                    
                    if (isDir)
                        path        = prefixUr + PACK + path + '.tar.gz';
                    else
                        path        = prefixUr + FS + path + '?download';
                    
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
        
        function getCurrentPosition() {
            var current     = Info.element,
                rect        = current.getBoundingClientRect();
                position    = {
                    x: rect.left + rect.width / 3,
                    y: rect.top
                };
            
            return position;
        }
        
        function listener(event) {
            var position,
                F9          = Key.F9,
                ESC         = Key.ESC,
                key         = event.keyCode,
                isBind      = Key.isBind();
            
            if (isBind && key === F9) {
                position = getCurrentPosition();
                MenuContext.show(position.x, position.y);
                
                event.preventDefault();
            }  else if (key === ESC) {
                    Menu.hide();
            }
        }
        
        init();
    }
})(CloudCmd, Util, DOM, CloudFunc);
