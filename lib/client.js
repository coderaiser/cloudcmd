var Util, DOM, CloudFunc;

(function(scope, Util, DOM, CloudFunc) {
    'use strict';
    
    scope.CloudCmd = new CloudCmdProto(Util, DOM, CloudFunc);
    
    function CloudCmdProto(Util, DOM, CloudFunc) {
        var Key,
            Listeners,
            Files                   = DOM.Files,
            Images                  = DOM.Images,
            Info                    = DOM.CurrentInfo,
            CloudCmd                = this,
            Storage                 = DOM.Storage;
        
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
         * @param event
         */
        this.loadDir                = function(params) {
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
            }, panel);
        };
        
        /**
         * функция устанавливает курсор на каталог
         * с которого мы пришли, если мы поднялись
         * в верх по файловой структуре
         * @param pDirName - имя каталога с которого мы пришли
         */
        function currentToParent(dirName) {
            var rootDir;
            /* убираем слэш с имени каталога */
            dirName     = Util.rmStr(dirName, '/');
            rootDir     = DOM.getCurrentFileByName(dirName);
            
            if (rootDir)
                DOM.setCurrentFile(rootDir);
        }
        
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
                    name = Util.getStrBigFirst(path);
                    name = Util.rmStr(name, '.js');
                    
                    slash = name.indexOf('/');
                    if (slash > 0) {
                        afterSlash = name.substr(slash);
                        name = Util.rmStr(name, afterSlash);
                    }
                }
                
                isContain = Util.isContainStr(path, '.js');
                
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
                                
                                if (!error && Util.isFunction(Proto))
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
        this.init                    = function() {
            var func        = function() {
                    Util.exec.series([
                        initModules,
                        baseInit,
                        Util.exec.with(CloudCmd.route, location.hash)
                    ]);
                },
                
                funcBefore  = function(callback) {
                    var src     = CloudCmd.LIBDIRCLIENT + 'polyfill.js';
                    
                    DOM.loadJquery(function() {
                        DOM.load.js(src, callback);
                    });
                };
            
            Util.exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
        };
        
        this.route                   = function(path) {
            var module, file, current, msg,
                query   = path.split('/');
            
            if (path) {
                module      = query[0];
                module      = Util.slice(module, 1).join('');
                module      = Util.getStrBigFirst(module);
                
                file        = query[1];
                current     = DOM.getCurrentFileByName(file);
                
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
                    path  : 'key.js',
                    func : callback
                 });
             });
            
            DOM.Files.get('modules', function(error, modules) {
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
                    if (Util.isString(module))
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
            /* загружаем Google Analytics */
            Listeners.analytics();
            
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
                isObj   = Util.isObject(obj);
            
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
        
        this.refresh                =  function(current, panelParam) {
            var NEEDREFRESH     = true,
                panel           = panelParam || current && current.parentElement,
                path            = DOM.getCurrentDirPath(panel),
                notSlashlLink   = CloudFunc.rmLastSlash(path) || '/';
            
            if (!panel)
                panel   = Info.panel;
            
            CloudCmd.loadDir({
                path        : notSlashlLink,
                isRefresh   : NEEDREFRESH,
                history     : false,
                panel       : panel
            });
        };
        
        /**
         * Функция загружает json-данные о Файловой Системе
         * через ajax-запрос.
         * @param path - каталог для чтения
         * @param pOptions
         * { refresh, history } - необходимость обновить данные о каталоге
         */
        function ajaxLoad(path, options, panel) {
            if (!options)
                options    = {};
            
            Util.log ('reading dir: "' + path + '";');
            
            Storage.get(path, function(error, json) {
                var RESTful     = DOM.RESTful,
                    obj         = Util.parseJSON(json),
                    isRefresh   = options.refresh,
                    history     = options.history;
                
                if (!isRefresh && json)
                    createFileTable(obj, panel, history);
                else
                    RESTful.read(path, 'json', function(obj) {
                        createFileTable(obj, panel, history);
                        Storage.set(path, obj);
                    });
            });
        }
        
        /**
         * Функция строит файловую таблицу
         * @param json  - данные о файлах
         * @param panelParam
         * @param history
         */
        function createFileTable(json, panelParam, history) {
            var files,
                panel           = panelParam || DOM.getPanel(),
                /* getting current element if was refresh */
                path            = DOM.getCurrentDirPath(panel),
                wasRefresh      = path === json.path,
                names           = ['file', 'path', 'link', 'pathLink'];
            
            Files.get(names, function(error, templFile, templPath, templLink, templPathLink) {
                var n, found, varCurrent, varName, current,
                    dir     = DOM.getCurrentDirName(),
                    name    = DOM.getCurrentName(),
                    i       = panel.childNodes.length;
                
                while(i--)
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
                
                files           = DOM.getFiles(panel);
                
                /* searching current file */
                if (wasRefresh) {
                    n = files.length;
                    
                    for (i = 0; i < n ; i++) {
                        varCurrent  = files[i],
                        varName     = DOM.getCurrentName(varCurrent);
                        found       = varName === name;
                        
                        if (found) {
                            current    = files[i];
                            break;
                        }
                    }
                }
                if (!found) /* .. */
                    current = files[0];
                
                DOM.setCurrentFile(current, {
                    history: history
                });
                
                Listeners.setOnPanel(panel.id);
                
                if (name === '..' && dir !== '/')
                    currentToParent(dir);
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
            
            ret = Util.stringifyJSON(fileTable);
            
            return ret;
        }
        
        this.goToParentDir          = function() {
            var path        = Info.dirPath,
                parentPath  = Info.parentDirPath;
            
            if (path !== parentPath) {
                path    = parentPath;
                path    = CloudFunc.FS + CloudFunc.rmLastSlash(path);
                
                CloudCmd.loadDir({
                    path: path
                });
            }
        };
        
    }
})(this, Util, DOM, CloudFunc);
