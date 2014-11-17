var Util, DOM, CloudFunc, join;

(function(scope, Util, DOM, CloudFunc, join) {
    'use strict';
    
    scope.CloudCmd = new CloudCmdProto(Util, DOM, CloudFunc);
    
    function CloudCmdProto(Util, DOM, CloudFunc) {
        var Key,
            Listeners,
            Files                   = DOM.Files,
            Images                  = DOM.Images,
            Info                    = DOM.CurrentInfo,
            CloudCmd                = this,
            Storage                 = DOM.Storage,
            type                    = Util.type;
        
        this.PREFIX                 = '',
        this.MousePosition          = {};
        this.LIBDIR                 = '/lib/';
        this.LIBDIRCLIENT           = '/lib/client/';
        this.MIN_ONE_PANEL_WIDTH    = 1155;
        this.HOST                   = location.origin || 
                                      location.protocol + '//' + location.host;
        /**
         * Функция привязываеться ко всем ссылкам и
         *  загружает содержимое каталогов
         * 
         * @param params - {
         *          paramLink - ссылка
         *          needRefresh - необходимость обязательной загрузки данных с сервера
         *          panel
         *      }
         * @param callback
         */
        this.loadDir                = function(params, callback) {
            var link, imgPosition, panelChanged, pathParams,
                isRefresh, panel, history,
                p               = params;
            
            if (params) {
                pathParams      = p.path;
                isRefresh       = p.isRefresh;
                panel           = p.panel;
                history         = p.history;
            }
            
            if (pathParams)
                link = pathParams;
            
            if (panel && panel !== Info.panel) {
                DOM.changePanel();
                panelChanged = true;
            }
            
            if (panelChanged || isRefresh)
                imgPosition = {
                    top: true
                };
            
            Images.showLoad(imgPosition);
            
            /* загружаем содержимое каталога */
            ajaxLoad(link, {
                refresh     : isRefresh,
                history     : history
            }, panel, callback);
        };
        
        /**
         * function load modules
         * @pParams = {name, path, func, dobefore, arg}
         */
        function loadModule(params) {
            var name, path, func, doBefore, slash, afterSlash,
                funcName, isContain;
                    
            if (params) {
                name        = params.name,
                path        = params.path,
                func        = params.func,
                funcName    = params.funcName,
                doBefore    = params.dobefore;
                
                if (path && !name) {
                    name = getStrBigFirst(path);
                    name = Util.rmStr(name, '.js');
                    
                    slash = name.indexOf('/');
                    if (slash > 0) {
                        afterSlash = name.substr(slash);
                        name = Util.rmStr(name, afterSlash);
                    }
                }
                
                isContain   = /\.js/.test(path);
                
                if (!isContain)
                    path += '.js';
                
                if (!CloudCmd[name]) {
                    CloudCmd[name] = function() {
                        var pathFull    = CloudCmd.LIBDIRCLIENT + path,
                            args        = arguments;
                        
                        Util.exec(doBefore);
                        
                        return DOM.load.js(pathFull, func ||
                            function(error) {
                                var Proto = CloudCmd[name];
                                
                                if (!error && type.function(Proto))
                                    CloudCmd[name] = Util.applyConstructor(Proto, args);
                            });
                    };
                    
                    CloudCmd[name][funcName] = CloudCmd[name];
                }
            }
        }
        
        /** Конструктор CloudClient, который
         * выполняет весь функционал по
         * инициализации
         */
        this.init                    = function(prefix) {
            var func        = function() {
                    Util.exec.series([
                        initModules,
                        baseInit,
                        function() {
                            CloudCmd.route(location.hash);
                        }
                    ]);
                },
                
                funcBefore  = function(callback) {
                    var src     = CloudCmd.LIBDIRCLIENT + 'polyfill.js';
                    
                    DOM.loadJquery(function() {
                        DOM.load.js(src, callback);
                    });
                };
            
            CloudCmd.PREFIX = prefix;
            CloudCmd.LIBDIR         = prefix + '/lib/';
            CloudCmd.LIBDIRCLIENT   = prefix + '/lib/client/';
            
            Util.exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
        };
        
        this.join                   = function(urls) {
            var prefix  = CloudCmd.PREFIX;
            
            Util.check(arguments, ['urls']);
            
            urls = urls.map(function(url) {
                return url.replace(prefix, '');
            });
            
            return prefix + join(urls);
        };
        
        this.route                   = function(path) {
            var module, file, current, msg,
                query   = path.split('/');
            
            if (path) {
                module      = query[0];
                module      = Util.slice(module, 1).join('');
                module      = getStrBigFirst(module);
                
                file        = query[1];
                current     = DOM.getCurrentByName(file);
                
                if (file && !current) {
                    msg = CloudFunc.formatMsg('set current file', file, 'error');
                    Util.log(msg);
                } else {
                    DOM.setCurrentFile(current);
                    CloudCmd.execFromModule(module, 'show');
                }
            }
        };
        
        function initModules(callback) {
            Util.exec.if(CloudCmd.Key, function() {
                Key          = new CloudCmd.Key();
                CloudCmd.Key = Key;
                Key.bind();
            }, function(callback) {
                loadModule({
                    /* привязываем клавиши к функциям */
                    path    : 'key.js',
                    func    : callback
                });
            });
            
            Files.get('modules', function(error, modules) {
                var storageObj, mod, path,
                    STORAGE     = 'storage',
                    showLoad    = Images.showLoad.bind(Images),
                    
                    doBefore    = {
                        'edit'                  : showLoad,
                        'menu'                  : showLoad,
                        'storage/_filepicker'   : showLoad
                    },
                    
                    load = function(name, path, func) {
                        var isTmpl = path === 'template';
                        
                        loadModule({
                            name        : name,
                            funcName    : isTmpl ? 'get' : 'show',
                            path        : path,
                            dobefore    : func
                        });
                    };
                
                if (!modules)
                    modules = [];
                
                modules.forEach(function(module) {
                    var isStr = type.string(module);
                    
                    if (isStr)
                        load(null, module, doBefore[module]);
                });
                
                storageObj = Util.findObjByNameInArr(modules, STORAGE),
                mod        = Util.getNamesFromObjArray(storageObj);
                
                mod.forEach(function(name) {
                    path = STORAGE + '/_' + name.toLowerCase();
                    
                    load(name, path, doBefore[path]);
                });
                
                callback();
            });
        }
        
        function baseInit(callback) {
            var dirPath = '',
                files   = DOM.getFiles(),
                LEFT    = CloudFunc.PANEL_LEFT,
                RIGHT   = CloudFunc.PANEL_RIGHT;
                    
            /* выделяем строку с первым файлом                                  */
            if (files)
                DOM.setCurrentFile(files[0]);
            
            dirPath     = DOM.getCurrentDirPath(),
            Listeners   = CloudCmd.Listeners;
            Listeners.init();
            
            Listeners.setOnPanel(LEFT);
            Listeners.setOnPanel(RIGHT);
            
            Listeners.initKeysPanel();
                    
            /* Устанавливаем кэш корневого каталога                         */ 
            dirPath     = CloudFunc.rmLastSlash(dirPath) || '/';
            
            Storage.get(dirPath, function(error, data) {
                if (!data) {
                    data    = getJSONfromFileTable();
                    Storage.set(dirPath, data);
                }
            });
            
            callback();
        }
        
        this.execFromModule         = function(moduleName, funcName, params) {
            var obj     = CloudCmd[moduleName],
                isObj   = Util.type.object(obj);
            
            Util.exec.if(isObj,
                function() {
                    var obj     = CloudCmd[moduleName],
                        func    = obj[funcName];
                    
                    Util.exec(func, params);
                },
                
                function(callback) {
                    Util.exec(obj, callback);
                });
        };
        
        this.refresh                =  function(panelParam, callback) {
            var panel           = panelParam || Info.panel,
                NEEDREFRESH     = true,
                path            = DOM.getCurrentDirPath(panel),
                notSlashlLink   = CloudFunc.rmLastSlash(path) || '/';
            
            CloudCmd.loadDir({
                path        : notSlashlLink,
                isRefresh   : NEEDREFRESH,
                history     : false,
                panel       : panel
            }, callback);
        };
        
        /**
         * Функция загружает json-данные о Файловой Системе
         * через ajax-запрос.
         * @param path - каталог для чтения
         * @param options
         * { refresh, history } - необходимость обновить данные о каталоге
         * @param panel
         * @param callback
         * 
         */
        function ajaxLoad(path, options, panel, callback) {
            var create = function(error, json) {
                var RESTful     = DOM.RESTful,
                    name        = Info.name,
                    obj         = Util.json.parse(json),
                    isRefresh   = options.refresh,
                    history     = options.history;
                
                if (!isRefresh && json)
                    createFileTable(obj, panel, history, callback);
                else
                    RESTful.read(path, 'json', function(obj) {
                        createFileTable(obj, panel, history, function() {
                            var current;
                            
                            if (isRefresh) {
                                current = DOM.getCurrentByName(name);
                                DOM.setCurrentFile(current);
                            }
                            
                            Util.exec(callback);
                        });
                        Storage.set(path, obj);
                    });
            };
            
            if (!options)
                options    = {};
            
            Util.log ('reading dir: "' + path + '";');
            
            Files.get('config', function(error, config) {
                var dirStorage;
                
                if (error)
                    Util.log(error);
                else
                    dirStorage = config.dirStorage;
                    
                if (dirStorage)
                    Storage.get(path, create);
                else
                    create();
            });
        }
        
        /**
         * Функция строит файловую таблицу
         * @param json  - данные о файлах
         * @param panelParam
         * @param history
         * @param callback
         */
        function createFileTable(json, panelParam, history, callback) {
            var names           = ['file', 'path', 'link', 'pathLink'];
            
            Files.get(names, function(error, templFile, templPath, templLink, templPathLink) {
                var Dialog  = DOM.Dialog,
                    current,
                    panel   = panelParam || Info.panel,
                    dir     = Info.dir,
                    name    = Info.name,
                    i       = panel.childNodes.length;
                
                if (error) {
                    Dialog.alert(error.responseText);
                } else {
                    while (i--)
                        panel.removeChild(panel.lastChild);
                    
                    panel.innerHTML = CloudFunc.buildFromJSON({
                        data        : json,
                        id          : panel.id,
                        template    : {
                            file        : templFile,
                            path        : templPath,
                            pathLink    : templPathLink,
                            link        : templLink
                        }
                    });
                    
                    Listeners.setOnPanel(panel.id);
                    
                    if (name === '..' && dir !== '/')
                        current = DOM.getCurrentByName(dir);
                    
                    if (!current)
                        current = DOM.getFiles(panel)[0];
                        
                    DOM.setCurrentFile(current, {
                        history: history
                    });
                    
                    Util.exec(callback);
                }
            });
        }
        
        /**
         * Функция генерирует JSON из html-таблицы файлов и
         * используеться при первом заходе в корень
         */
        function getJSONfromFileTable() {
            var current, name, size, owner, mode, ret,
                path        = DOM.getCurrentDirPath(),
                infoFiles   = Info.files,
                
                fileTable   = {
                    path    : path,
                    files   : []
                },
                
                files       = fileTable.files,
                
                i, n        = infoFiles.length;
            
            for (i = 0; i < n; i++) {
                current     = infoFiles[i];
                name        = DOM.getCurrentName(current);
                size        = DOM.getCurrentSize(current);
                owner       = DOM.getCurrentOwner(current);
                mode        = DOM.getCurrentMode(current);
                
                if (name !== '..')
                    files.push({
                        name    : name,
                        size    : size,
                        mode    : mode,
                        owner   : owner
                    });
            }
            
            ret = Util.json.stringify(fileTable);
            
            return ret;
        }
        
        this.goToParentDir          = function() {
            var path        = Info.dirPath,
                parentPath  = Info.parentDirPath;
            
            if (path !== parentPath) {
                path    = parentPath;
                path    = CloudFunc.rmLastSlash(path) || '/';
                
                CloudCmd.loadDir({
                    path: path
                });
            }
        };
        
        function getStrBigFirst(str) {
            var isStr   = Util.type.string(str),
                ret     = str;
            
            if (isStr && str.length)
                ret =  str[0].toUpperCase() + str.substring(1);
            
            return ret;
        }
        
    }
})(this, Util, DOM, CloudFunc, join);
