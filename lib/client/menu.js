var CloudCmd, Util, DOM, CloudFunc, MenuIO;

(function(CloudCmd, Util, DOM, CloudFunc) {
    'use strict';
    
    CloudCmd.Menu = MenuProto;
        
    function MenuProto(position) {
        var Name                        = 'Menu',
            Info                        = DOM.CurrentInfo,
            Loading                     = true,
            Key                         = CloudCmd.Key,
            Events                      = DOM.Events,
            MenuSeted                   = false,
            Menu                        = this,
            MenuContext,
            Position                    = CloudCmd.MousePosition,
            Images                      = DOM.Images,
            UploadToItemNames;
        
        this.ENABLED                    = false;
        
        function init() {
            Loading  = true;
            
            Util.loadOnLoad([
                load,
                //setUploadToItemNames,
                Menu.show
            ]);
            
            Events.addKey(listener);
        }
        
        this.hide   = function() {
            MenuContext.hide();
        };
        
        this.show   = function() {
            var fm, options, menuData,
                x = (position || Position).x,
                y = (position || Position).y;
            
            if (!Loading) {
                Key.unsetBind();
                MenuContext.show(x, y);
            } else {
                fm          = DOM.getFM();
                options     = {
                    icon        : true,
                    beforClose  : Key.setBind,
                    beforShow   : Key.unsetBind
                };
                menuData    = getMenuData();
                MenuContext = MenuIO(fm, options, menuData);
                
                MenuContext.show(x, y);
                Loading     = false;
                position    = null;
            }
        };
        
        function getMenuData() {
            var show = function(name) {
                    CloudCmd[name].show();
                },
                menuData = {
                    'View'          : Util.bind(show, 'View'),
                    'Edit'          : Util.bind(show, 'Edit'),
                    'Rename'        : function() {
                        setTimeout(DOM.renameCurrent, 100);
                    },
                    'Delete'        : DOM.promptDelete,
                    '(Un)Select All': DOM.toggleAllSelectedFiles,
                    'Zip file'      : DOM.zipFile,
                    'Unzip file'    : DOM.unzipFile,
                    'Upload To'     : {},
                    'Download'      : download,
                    'New'           : {
                         'File'             : DOM.promptNewFile,
                         'Directory'        : DOM.promptNewDir,
                         'From FilePicker'  : getFromPicker
                    }
                };
            
            getUploadTo(function(menuUpload) {
                menuData['Upload To'] = menuUpload;
            
            });
            
            return menuData;
        }
        
        function getUploadTo(callback) {
            CloudCmd.getModules(function(modules) {
                var menu    = {},
                    storage = Util.findObjByNameInArr(modules, 'storage'),
                    items   = Util.getNamesFromObjArray(storage) || [];
                    
                items.forEach(function(name) {
                    menu[name] = Util.bind(uploadTo, name);
                });
                
                callback(menu);
            });
        }
        
        function uploadTo(name) {
             Info.getData(function(data) {
                var name = Info.name;
                
                CloudCmd.execFromModule(name, 'uploadFile', {
                    name: name,
                    data: data
                });
            });
                    
            Util.log('Uploading to ' + name + '...');
        }
        
        function getFromPicker() {
            Images.showLoad({
                top: true
            });
            
            CloudCmd.execFromModule('FilePicker', 'saveFile', function(name, data) {
                var path = DOM.getCurrentDirPath() + name;
                
                DOM.RESTful.write(path,  data, CloudCmd.refresh);
            });
        }
        
        function download() {
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
        
        /** function loads css and js of Menu
         * @param callback
         */
        function load(callback) {
            Util.time(Name + ' load');
            
            var dir     = CloudCmd.LIBDIRCLIENT + 'menu/',
                files   = [
                    dir + 'menu-io.js',
                    dir + 'menu-io.css'
                ];
            
            DOM.anyLoadInParallel(files, function() {
                Util.timeEnd(Name + ' load');
                Images.hide();
                Util.exec(callback);
            });
        }
        
        function listener(event) {
            var F9          = Key.F9,
                ESC         = Key.ESC,
                key         = event.keyCode,
                isBind      = Key.isBind();
            
            if (isBind && key === F9) {
                MenuContext.show(Position);
                
                DOM.preventDefault(event);
            }  else if (key === ESC)
                    MenuContext.hide();
        }
        
        init();
    }
})(CloudCmd, Util, DOM, CloudFunc);
