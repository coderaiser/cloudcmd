/* global itype */

var Util, DOM, CloudFunc, join;

(function(scope, Util, DOM, CloudFunc) {
    'use strict';
    
    scope.CloudCmd = new CloudCmdProto(Util, DOM, CloudFunc);
    
    function CloudCmdProto(Util, DOM, CloudFunc) {
        var Key,
            Debug,
            log                     = function(str) {
                if (Debug)
                    console.log(str);
            },
            
            TITLE,
            Listeners,
            Files                   = DOM.Files,
            Images                  = DOM.Images,
            Info                    = DOM.CurrentInfo,
            CloudCmd                = this,
            Storage                 = DOM.Storage;
        
        this.log                    = log;
        this.PREFIX                 = '';
        this.PREFIX_URL             = '';
        this.LIBDIR                 = '/lib/';
        this.LIBDIRCLIENT           = '/client/';
        this.MIN_ONE_PANEL_WIDTH    = 1155;
        this.HOST                   = location.origin ||
                                      location.protocol + '//' + location.host;
        
        this.TITLE                  = 'Cloud Commander';
        
        TITLE                       = this.TITLE;
        
        log.enable     = function() {
            Debug = true;
        };
        
        log.disable    = function() {
            Debug = false;
        };
        
        var getStrBigFirst = Util.getStrBigFirst;
        var kebabToCamelCase = Util.kebabToCamelCase;
        
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
        this.loadDir = function(params, callback) {
            var imgPosition;
            var panelChanged;
            var noCurrent;
            var isRefresh;
            var panel;
            var history;
            var p = params;
            
            if (params) {
                isRefresh       = p.isRefresh;
                panel           = p.panel;
                history         = p.history;
                noCurrent       = p.noCurrent;
            }
            
            if (!noCurrent)
                if (panel && panel !== Info.panel) {
                    DOM.changePanel();
                    panelChanged = true;
                }
            
            if (panelChanged || isRefresh || !history)
                imgPosition = 'top';
            
            Images.show.load(imgPosition, panel);
            
            /* загружаем содержимое каталога */
            ajaxLoad(p.path, {
                refresh     : isRefresh,
                history     : history,
                noCurrent   : noCurrent
            }, panel, callback);
        };
        
        /**
         * function load modules
         * @pParams = {name, path, func, dobefore, arg}
         */
        function loadModule(params) {
            var name, path, func, doBefore,
                funcName, isContain;
                    
            if (params) {
                name        = params.name,
                path        = params.path,
                func        = params.func,
                funcName    = params.funcName,
                doBefore    = params.dobefore;
                
                if (path && !name)
                    name = kebabToCamelCase(path);
                
                isContain   = /\.js/.test(path);
                
                if (!isContain)
                    path += '.js';
                
                if (!CloudCmd[name]) {
                    CloudCmd[name] = function() {
                        var prefix      = CloudCmd.PREFIX,
                            pathFull    = prefix + CloudCmd.LIBDIRCLIENT + path,
                            args        = arguments;
                        
                        Util.exec(doBefore);
                        
                        return DOM.load.js(pathFull, func ||
                            function(error) {
                                var Proto = CloudCmd[name];
                                
                                if (!error && itype.function(Proto))
                                    CloudCmd[name] = applyConstructor(Proto, args);
                            });
                    };
                    
                    CloudCmd[name][funcName] = CloudCmd[name];
                }
            }
        }
        
        /*
         * apply arguemnts to constructor
         *
         * @param constructor
         * @param args
         */
        function applyConstructor(constructor, args) {
            var F = function () {
                return constructor.apply(this, args);
            };
            
            F.prototype = constructor.prototype;
            return new F();
        }
        
        /** Конструктор CloudClient, который
         * выполняет весь функционал по
         * инициализации
         */
        this.init = function(config) {
            var func = function() {
                Util.exec.series([
                    initModules,
                    baseInit,
                    loadPlugins,
                    function() {
                        CloudCmd.route(location.hash);
                    }
                ]);
            };
            
            var funcBefore  = function(callback) {
                var src = prefix + '/join:' + [
                    CloudCmd.LIBDIRCLIENT + 'polyfill.js',
                    '/modules/domtokenlist-shim/dist/domtokenlist.min.js',
                ].join(':');
                
                DOM.loadJquery(function() {
                    DOM.load.js(src, callback);
                });
            };
            
            var prefix = config.prefix;
            
            CloudCmd.PREFIX = prefix;
            CloudCmd.PREFIX_URL = prefix + CloudFunc.apiURL;
            
            CloudCmd.config = function(key) {
                return config[key];
            };
            
            CloudCmd._config = function(key, value) {
                /*
                 * should be called from config.js only
                 * after successful update on server
                 */
                config[key] = value;
            };
            
            if (config.onePanelMode)
                CloudCmd.MIN_ONE_PANEL_WIDTH = Infinity;
            
            DOM.Dialog = new DOM.Dialog(prefix, {
                htmlDialogs: config.htmlDialogs
            });
            
            Util.exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
        };
        
        function loadPlugins(callback) {
            var prefix = CloudCmd.PREFIX;
            var plugins = prefix + '/plugins.js';
            
            DOM.load.js(plugins, callback);
        }
        
        this.join                   = function(urls) {
            var prefix  = CloudCmd.PREFIX;
            
            if (!Array.isArray(urls))
                throw Error('urls should be array!');
            
            var noPrefixUrls = urls.map(function(url) {
                return url.replace(prefix, '');
            });
            
            return prefix + join(noPrefixUrls);
        };
        
        this.route                   = function(path) {
            var module, file, current, msg,
                query = path.split('/');
            
            if (path) {
                module = query[0];
                module = module.slice(1);
                module = getStrBigFirst(module);
                
                file = query[1];
                current = DOM.getCurrentByName(file);
                
                if (file && !current) {
                    msg = CloudFunc.formatMsg('set current file', file, 'error');
                    CloudCmd.log(msg);
                } else {
                    DOM.setCurrentFile(current);
                    CloudCmd.execFromModule(module, 'show');
                }
            }
        };
        
        this.logOut = function() {
            DOM.load.ajax({
                url: CloudCmd.PREFIX + '/logout',
                error: function() {
                    document.location.reload();
                }
            });
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
                    showLoad    = Images.show.load,
                    
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
                    var isStr = itype.string(module);
                    
                    if (isStr)
                        load(null, module, doBefore[module]);
                });
                
                storageObj = Util.findObjByNameInArr(modules, STORAGE);
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
                files   = DOM.getFiles();
                    
            /* выделяем строку с первым файлом */
            if (files)
                DOM.setCurrentFile(files[0], {
                    // when hash is present
                    // it should be handled with this.route
                    // overwre otherwise
                    history: !location.hash
                });
            
            dirPath     = DOM.getCurrentDirPath(),
            Listeners   = CloudCmd.Listeners;
            Listeners.init();
            
            Listeners.setOnPanel('left');
            Listeners.setOnPanel('right');
            
            Listeners.initKeysPanel();
            
            Storage.get(dirPath, function(error, data) {
                if (!data) {
                    data    = getJSONfromFileTable();
                    Storage.set(dirPath, data);
                }
            });
            
            callback();
        }
        
        this.execFromModule         = function(moduleName, funcName) {
            var args    = [].slice.call(arguments, 2),
                obj     = CloudCmd[moduleName],
                isObj   = itype.object(obj);
            
            Util.exec.if(isObj,
                function() {
                    var obj     = CloudCmd[moduleName],
                        func    = obj[funcName];
                    
                    func.apply(null, args);
                }, obj);
        };
        
        this.refresh                =  function(panelParam, options, callback) {
            var panel           = panelParam || Info.panel,
                noCurrent,
                NEEDREFRESH     = true,
                path            = DOM.getCurrentDirPath(panel);
            
            if (options)
                noCurrent       = options.noCurrent;
            
            if (!callback && typeof options === 'function') {
                callback    = options;
                options     = {};
            }
            
            CloudCmd.loadDir({
                path        : path,
                isRefresh   : NEEDREFRESH,
                history     : false,
                panel       : panel,
                noCurrent   : noCurrent
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
                    noCurrent   = options.noCurrent;
                
                if (!isRefresh && json)
                    createFileTable(obj, panel, options, callback);
                else
                    RESTful.read(path, 'json', function(error, obj) {
                        if (!error) {
                            Storage.set(path, obj);
                            
                            createFileTable(obj, panel, options, function() {
                                if (isRefresh && !noCurrent) {
                                    DOM.setCurrentByName(name);
                                }
                                
                                Util.exec(callback);
                            });
                        }
                    });
            };
            
            if (!options)
                options    = {};
            
            CloudCmd.log('reading dir: "' + path + '";');
            
            var dirStorage = CloudCmd.config(dirStorage);
            
            if (!dirStorage)
                return create();
            
            Storage.get(path, create);
        }
        
        /**
         * Функция строит файловую таблицу
         * @param json  - данные о файлах
         * @param panelParam
         * @param history
         * @param callback
         */
        function createFileTable(json, panelParam, options, callback) {
            var history     = options.history,
                noCurrent   = options.noCurrent,
                names       = ['file', 'path', 'link', 'pathLink'];
            
            Files.get(names, function(error, templFile, templPath, templLink, templPathLink) {
                var childNodes, i,
                    Dialog      = DOM.Dialog,
                    current,
                    panel       = panelParam || DOM.getPanel(),
                    
                    dir         = Info.dir,
                    name        = Info.name;
                
                if (error) {
                    Dialog.alert(TITLE, error.responseText);
                } else {
                    childNodes  = panel.childNodes;
                    i           = childNodes.length;
                    
                    while (i--)
                        panel.removeChild(panel.lastChild);
                    
                    panel.innerHTML = CloudFunc.buildFromJSON({
                        data        : json,
                        id          : panel.id,
                        prefix      : CloudCmd.PREFIX,
                        template    : {
                            file        : templFile,
                            path        : templPath,
                            pathLink    : templPathLink,
                            link        : templLink
                        }
                    });
                    
                    Listeners.setOnPanel(panel);
                    
                    if (!noCurrent) {
                        if (name === '..' && dir !== '/')
                            current = DOM.getCurrentByName(dir);
                        
                        if (!current)
                            current = DOM.getFiles(panel)[0];
                            
                        DOM.setCurrentFile(current, {
                            history: history
                        });
                    }
                    
                    Util.exec(callback);
                }
            });
        }
        
        /**
         * Функция генерирует JSON из html-таблицы файлов и
         * используеться при первом заходе в корень
         */
        function getJSONfromFileTable() {
            var name, size, owner, mode, ret,
                path        = DOM.getCurrentDirPath(),
                infoFiles   = Info.files || [],
                
                fileTable   = {
                    path    : path,
                    files   : []
                },
                
                files       = fileTable.files;
            
            [].forEach.call(infoFiles, function(current) {
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
            });
            
            ret = Util.json.stringify(fileTable);
            
            return ret;
        }
        
        this.goToParentDir          = function() {
            var path        = Info.dirPath,
                dir         = Info.dir,
                parentPath  = Info.parentDirPath;
            
            if (path !== parentPath) {
                path    = parentPath;
                
                CloudCmd.loadDir({
                    path: path,
                }, function() {
                    var current,
                        panel   = Info.panel;
                    
                    current = DOM.getCurrentByName(dir);
                    
                    if (!current)
                        current = DOM.getFiles(panel)[0];
                        
                    DOM.setCurrentFile(current, {
                        history: history
                    });
                });
            }
        };
    }
})(this, Util, DOM, CloudFunc);
