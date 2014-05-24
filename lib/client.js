var Util, DOM, CloudFunc;

(function(scope, Util, DOM, CloudFunc) {
    'use strict';
    
    scope.CloudCmd = new CloudCmdProto(Util, DOM, CloudFunc);
    
    function CloudCmdProto(Util, DOM, CloudFunc) {
        var Key, Config, Modules, Extensions,
            FileTemplate, PathTemplate, Listeners,
            DIR_HTML                = '/html/',
            DIR_HTML_FS             = DIR_HTML + 'fs/',
            DIR_JSON                = '/json/',
            
            Images                  = DOM.Images,
            Info                    = DOM.CurrentInfo,
            CloudCmd                = this,
            Storage                 = DOM.Storage;
        
        this.MousePosition          = {};
        this.LIBDIR                 = '/lib/';
        this.LIBDIRCLIENT           = '/lib/client/';
        this.MIN_ONE_PANEL_WIDTH    = 1155;
        this.OLD_BROWSER            = false;
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
                isRefresh, panel, nohistory,
                p               = params,
                currentLink     = DOM.getCurrentLink(),
                href            = currentLink.href;
            
            if (params) {
                pathParams      = p.path;
                isRefresh       = p.isRefresh;
                panel           = p.panel;
                nohistory       = p.nohistory;
            }
            
            if (pathParams)
                link = pathParams;
            else
                link = Util.rmStr(href, CloudCmd.HOST);
            
            if (link || currentLink.target !== '_blank') {
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
                    nohistory   : nohistory
                }, panel);
            }
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
                isContain;
                    
            if (params) {
                name        = params.name,
                path        = params.path,
                func        = params.func,
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
                        
                        return DOM.jsload(pathFull, func ||
                            function() {
                                var Proto = CloudCmd[name];
                                
                                if (Util.isFunction(Proto))
                                    CloudCmd[name] = Util.applyConstructor(Proto, args);
                            });
                    };
                    
                    CloudCmd[name].show = CloudCmd[name];
                }
            }
        }
        
        /** Конструктор CloudClient, который
         * выполняет весь функционал по
         * инициализации
         */
        this.init                    = function() {
            var callback = function() {
                    Util.exec.series([
                        initModules,
                        baseInit,
                        Util.exec.with(CloudCmd.route, location.hash)
                    ]);
                },
                
                func = function(callback) {
                    var src = CloudCmd.LIBDIRCLIENT + 'polyfill.js';
                    
                    CloudCmd.OLD_BROWSER = true;
                    
                    DOM.jqueryLoad(function() {
                        DOM.jsload(src, callback);
                    });
                };
            
            Util.exec.if(document.body.scrollIntoViewIfNeeded, callback, func);
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
            
            CloudCmd.getModules(function(modules) {
                var storageObj, mod, path,
                    STORAGE     = 'storage',
                    showLoad    = Images.showLoad.bind(Images),
                    
                    doBefore    = {
                        'edit'                  : showLoad,
                        'menu'                  : showLoad,
                        'storage/_filepicker'   : showLoad
                    },
                    
                    load = function(name, path, func) {
                        loadModule({
                            name        : name,
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
                
                Util.exec(callback);
            });
        }
        
        function baseInit(pCallBack) {
            var files       = DOM.getFiles(),
                LEFT        = CloudFunc.PANEL_LEFT,
                RIGHT       = CloudFunc.PANEL_RIGHT;
                    
            /* выделяем строку с первым файлом                                  */
            if (files)
                DOM.setCurrentFile(files[0]);
                
            Listeners = CloudCmd.Listeners;
            Listeners.init();
            /* загружаем Google Analytics */
            Listeners.analytics();
            Listeners.changeLinks(LEFT);
            Listeners.changeLinks(RIGHT);
            
            Listeners.setOnPanel(LEFT);
            Listeners.setOnPanel(RIGHT);
            
            Listeners.initKeysPanel();
                    
            CloudCmd.getConfig(function(config) {
                var localStorage    = config.localStorage,
                    dirPath         = DOM.getCurrentDirPath();
                
                /* устанавливаем переменную доступности кэша                    */
                Storage.setAllowed(localStorage);
                /* Устанавливаем кэш корневого каталога                         */ 
                
                dirPath     = CloudFunc.rmLastSlash(dirPath) || '/';
                
                Storage.get(dirPath, function(data) {
                    if (!data) {
                        data    = getJSONfromFileTable();
                        Storage.set(dirPath, data);
                    }
                });
            });
            
            Util.exec(CloudCmd.Key);
            Util.exec(pCallBack);
        }
        
        this.getTemplate = function(data, name, callback) {
            var path    = DIR_HTML + name +'.html',
                func    = getSystemFile(data, path);
                
            func(callback);
        };
        
        function getSystemFile(pGlobal, pURL) {
            
            function lGetSysFile(callback) {
                Util.exec.if(pGlobal, callback, function() {
                    DOM.ajax({
                        url     : pURL,
                        success : function(pLocal) {
                            pGlobal = pLocal;
                            Util.exec(callback, pLocal);
                        }
                    });
                });
            }
            
            return lGetSysFile;
        }
        
        this.setConfig              = function(config) { Config = config; };
        this.getConfig              = function(callback) {
            Util.exec.if(Config, callback, function() {
                var RESTful = DOM.RESTful;
                
                RESTful.Config.read(function(config) {
                    Config = config;
                    callback(config);
                });
            });
        };
        
        this.getModules             = getSystemFile(Modules,        DIR_JSON    + 'modules.json');
        this.getExt                 = getSystemFile(Extensions,     DIR_JSON    + 'ext.json');
        this.getFileTemplate        = getSystemFile(FileTemplate,   DIR_HTML_FS + 'file.html');
        this.getPathTemplate        = getSystemFile(PathTemplate,   DIR_HTML_FS + 'path.html');
        this.getLinkTemplate        = getSystemFile(PathTemplate,   DIR_HTML_FS + 'link.html');
        
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
                link            = CloudFunc.FS + path,
                notSlashlLink   = CloudFunc.rmLastSlash(link);
            
            CloudCmd.loadDir({
                path        : notSlashlLink, 
                isRefresh   : NEEDREFRESH,
                panel: panel
            });
        };
        
        /**
         * Функция загружает json-данные о Файловой Системе
         * через ajax-запрос.
         * @param path - каталог для чтения
         * @param pOptions
         * { refresh, nohistory } - необходимость обновить данные о каталоге
         */
        function ajaxLoad(path, options, panel) {
            var SLASH       = '/',
                fsPath      = decodeURI(path),
                cleanPath   = Util.rmStrOnce(fsPath, CloudFunc.FS) || SLASH;
            
            if (!options)
                options    = {};
            
            Util.log ('reading dir: "' + cleanPath + '";');
            
            Storage.get(cleanPath, function(json) {
                var RESTful     = DOM.RESTful,
                    obj         = Util.parseJSON(json),
                    isRefresh   = options.refresh,
                    nohistory   = options.nohistory;
                
                if (!isRefresh && json)
                    createFileTable(obj, panel, nohistory);
                else
                    RESTful.read(cleanPath, 'json', function(obj) {
                        createFileTable(obj, panel, nohistory);
                        Storage.set(cleanPath, obj);
                    });
            });
        }
        
        /**
         * Функция строит файловую таблицу
         * @param json  - данные о файлах
         * @param panelParam
         * @param nohistory
         */
        function createFileTable(json, panelParam, nohistory) {
            var files,
                panel           = panelParam || DOM.getPanel(),
                /* getting current element if was refresh */
                path            = DOM.getCurrentDirPath(panel),
                wasRefresh      = path === json.path,
                funcs           = [
                    CloudCmd.getFileTemplate,
                    CloudCmd.getPathTemplate,
                    CloudCmd.getLinkTemplate
                ];
            
            Util.exec.parallel(funcs, function(templFile, templPath, templLink) {
                var n, found, varCurrent, varName, current,
                    dir     = DOM.getCurrentDirName(),
                    name    = DOM.getCurrentName(),
                    i       = panel.childNodes.length;
                
                while(i--)
                    panel.removeChild(panel.lastChild);
                
                panel.innerHTML = CloudFunc.buildFromJSON(json, templFile, templPath, templLink);
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
                    nohistory: nohistory
                });
                
                Listeners.changeLinks(panel.id);
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
                
                mode        = CloudFunc.getNumericPermissions(mode);
                
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
