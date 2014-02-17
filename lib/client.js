var Util, DOM, CloudFunc;
/* Функция которая возвратит обьект CloudCmd
 * @CloudFunc - обьект содержащий общий функционал
 *  клиентский и серверный
 */
(function(scope, Util, DOM, CloudFunc) {
    'use strict';
    
    scope.CloudCmd = new CloudCmdProto(Util, DOM, CloudFunc);
    
    function CloudCmdProto(Util, DOM, CloudFunc) {
        var Key, Config, Modules, Extensions,
            FileTemplate, PathTemplate, LinkTemplate, Listeners,
            Images                  = DOM.Images,
            Info                    = DOM.CurrentInfo,
            CloudCmd                = this,
            Storage                 = DOM.Storage;
        
        this.LIBDIR                 = '/lib/';
        this.LIBDIRCLIENT           = '/lib/client/';
        this.JSONDIR                = '/json/';
        this.HTMLDIR                = '/html/';
        this.MIN_ONE_PANEL_WIDTH    = 1155;
        this.OLD_BROWSER            = false;
        this.HOST                   =  (function() {
            var location = document.location;
            return location.protocol + '//' + location.host;
        })();
        
        /**
         * Функция привязываеться ко всем ссылкам и
         *  загружает содержимое каталогов
         * 
         * @param pLink - ссылка
         * @param pNeedRefresh - необходимость обязательной загрузки данных с сервера
         */
        this.loadDir                = function(link, needRefresh) {
            return function(event) {
                var currentLink    = DOM.getCurrentLink(),
                    href           = currentLink.href;
                
                if (!link)
                    link = Util.removeStr(href, CloudCmd.HOST);
                
                link += '?json';
                
                if (link || currentLink.target !== '_blank') {
                    Images.showLoad(!needRefresh ? null: {
                        top:true
                    });
                    
                    /* загружаем содержимое каталога */
                    CloudCmd.ajaxLoad(link, {
                        refresh: needRefresh
                    });
                }
                
                DOM.preventDefault(event);
            };
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
            dirName     = Util.removeStr(dirName, '/');
            rootDir     = DOM.getCurrentFileByName(dirName);
            
            if (rootDir) {
                DOM.setCurrentFile(rootDir);
                DOM.scrollIntoViewIfNeeded(rootDir, true);
            }
        }
        
        /**
         * function load modules
         * @pParams = {name, path, func, dobefore, arg}
         */
        function loadModule(pParams) {
            var lName, lPath, lFunc, lDoBefore, lSlash, lAfterSlash,
                isContain;
                    
            if (pParams) {
                lName       = pParams.name,
                lPath       = pParams.path,
                lFunc       = pParams.func,
                lDoBefore   = pParams.dobefore;
                
                if (Util.isString(pParams))
                    lPath = pParams;
                
                if (lPath && !lName) {
                    lName = Util.getStrBigFirst(lPath);
                    lName = Util.removeStr(lName, '.js');
                    
                    lSlash = lName.indexOf('/');
                    if (lSlash > 0) {
                        lAfterSlash = lName.substr(lSlash);
                        lName = Util.removeStr(lName, lAfterSlash);
                    }
                }
                
                isContain = Util.isContainStr(lPath, '.js');
                if (!isContain)
                    lPath += '.js';
                
                if (!CloudCmd[lName]) {
                    CloudCmd[lName] = function(pArg) {
                        var path = CloudCmd.LIBDIRCLIENT + lPath;
                        
                        Util.exec(lDoBefore);
                        
                        return DOM.jsload(path, lFunc ||
                            function() {
                                var Proto = CloudCmd[lName];
                                
                                if (Util.isFunction(Proto))
                                    CloudCmd[lName] = new Proto(pArg);
                            });
                    };
                    
                    CloudCmd[lName].show = CloudCmd[lName];
                }
            }
        }
        
        /** Конструктор CloudClient, который
         * выполняет весь функционал по
         * инициализации
         */
        this.init                    = function() {
            var lCallBack, lFunc;
            
            lCallBack = function() {
                Util.loadOnLoad([
                    initModules,
                    baseInit,
                    Util.bind(CloudCmd.route, location.hash)
                ]);
            },
            lFunc = function(pCallBack) {
                CloudCmd.OLD_BROWSER = true;
                var lSrc = CloudCmd.LIBDIRCLIENT + 'polyfill.js';
                
                DOM.jqueryLoad(
                    DOM.retJSLoad(lSrc, pCallBack)
                );
            };
            
            Util.ifExec(document.body.scrollIntoViewIfNeeded, lCallBack, lFunc);
        };
        
        this.route                   = function(pPath) {
            var lQuery, lModule, lFile, lCurrent, lMsg;
            
            if (pPath.length > 0) {
                lQuery  = pPath.split('/');
                
                if (lQuery.length > 0) {
                    lModule     = Util.getStrBigFirst(lQuery[1]);
                    lFile       = lQuery[2];
                    lCurrent    = DOM.getCurrentFileByName(lFile);
                    if (lFile && !lCurrent) {
                        lMsg = CloudFunc.formatMsg('set current file', lFile, 'error');
                        Util.log(lMsg);
                    } else {
                        DOM.setCurrentFile(lCurrent);
                        CloudCmd.execFromModule(lModule, 'show');
                    }
                }
            }
        };
        
        function initModules(pCallBack) {
            Util.ifExec(CloudCmd.Key, function() {
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
            
            CloudCmd.getModules(function(pModules) {
                pModules            = pModules || [];
                
                var i, n, module, storageObj, mod, name, path,
                    STORAGE  = 'storage',
                    showLoadFunc    = Util.bind(Images.showLoad, {
                        top:true
                    }),
                    
                    doBefore       = {
                        'edit'  : showLoadFunc,
                        'view'  : showLoadFunc,
                        'menu'  : showLoadFunc
                    },
                    
                    load = function(name, path, func) {
                        loadModule({
                            name        : name,
                            path        : path,
                            dobefore    : func
                        });
                    };
                
                for (i = 0, n = pModules.length; i < n ; i++) {
                    module = pModules[i];
                    
                    if (Util.isString(module))
                        load(null, module, doBefore[module]);
                }
                
                storageObj = Util.findObjByNameInArr(pModules, STORAGE),
                mod        = Util.getNamesFromObjArray(storageObj);
                    
                for (i = 0, n = mod.length; i < n; i++) {
                    name = mod[i],
                    path = STORAGE + '/_' + name.toLowerCase();
                    
                    load(name, path);
                }
                
                Util.exec(pCallBack);
                
            });
        }
        
        
        function baseInit(pCallBack) {
            var LIB         = CloudCmd.LIBDIR,
                LIBCLIENT   = CloudCmd.LIBDIRCLIENT,
                files       = DOM.getFiles(),
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
            
            Listeners.initKeysPanel();
                    
            CloudCmd.getConfig(function(config) {
                var localStorage    = config.localStorage,
                    dirPath         = DOM.getCurrentDirPath();
                
                /* устанавливаем переменную доступности кэша                    */
                Storage.setAllowed(localStorage);
                /* Устанавливаем кэш корневого каталога                         */ 
                
                dirPath     = CloudFunc.rmLastSlash(dirPath) || '/';
                
                if (!Storage.get(dirPath))
                    Storage.set(dirPath, getJSONfromFileTable());
                });
            
            Util.exec(CloudCmd.Key);
            Util.exec(pCallBack);
        }
        
        function getSystemFile(pGlobal, pURL) {
            
            function lGetSysFile(pCallBack) {
                Util.ifExec(pGlobal, pCallBack, function(pCallBack) {
                    DOM.ajax({
                        url     : pURL,
                        success : function(pLocal) {
                            pGlobal = pLocal;
                            Util.exec(pCallBack, pLocal);
                        }
                    });
                });
            }
            
            return lGetSysFile;
        }
        
        this.setConfig              = function(config) { Config = config; };
        this.getConfig              = getSystemFile(Config,         CloudCmd.JSONDIR + 'config.json');
        this.getModules             = getSystemFile(Modules,        CloudCmd.JSONDIR + 'modules.json');
        this.getExt                 = getSystemFile(Extensions,        CloudCmd.JSONDIR + 'ext.json');
        this.getFileTemplate        = getSystemFile(FileTemplate,   CloudCmd.HTMLDIR + 'file.html');
        this.getPathTemplate        = getSystemFile(PathTemplate,   CloudCmd.HTMLDIR + 'path.html');
        this.getLinkTemplate        = getSystemFile(PathTemplate,   CloudCmd.HTMLDIR + 'link.html');
        
        this.execFromModule         = function(pModuleName, pFuncName, pParams) {
            var lObject     = CloudCmd[pModuleName];
            Util.ifExec(Util.isObject(lObject),
                function() {
                    var lObj = CloudCmd[pModuleName];
                    Util.exec( lObj[pFuncName], pParams);
                },
                
                function(pCallBack) {
                    Util.exec(lObject, pCallBack);
                });
        };
        
        this.refresh                =  function(current) {
            var NEEDREFRESH     = true,
                panel           = current && current.parentElement,
                path            = DOM.getCurrentDirPath(panel),
                link            = CloudFunc.FS + path,
                notSlashlLink   = CloudFunc.rmLastSlash(link),
                load            = CloudCmd.loadDir(notSlashlLink, NEEDREFRESH);
            
            load();
        };
        
        /**
         * Функция загружает json-данные о Файловой Системе
         * через ajax-запрос.
         * @param path - каталог для чтения
         * @param pOptions
         * { refresh, nohistory } - необходимость обновить данные о каталоге
         */
        this.ajaxLoad               = function(path, options) {
            var json, str,
                ret         = options && options.refresh,
                SLASH       = '/',
                dirPath     = DOM.getCurrentDirPath(),
                fsPath      = decodeURI(path),
                noJSONPath  = Util.removeStr(fsPath, '?json' ),
                cleanPath   = Util.removeStrOneTime(noJSONPath, CloudFunc.FS) || SLASH,
                setTitle    = function() {
                    var title;
                    
                    dirPath = CloudFunc.rmLastSlash(dirPath) || '/';
                    
                    if (dirPath !== cleanPath) {
                        if (!options.nohistory)
                            DOM.setHistory(noJSONPath, null, noJSONPath);
                        
                        title   = CloudFunc.getTitle(cleanPath);
                        DOM.setTitle(title);
                    }
                };
            
            if (!options)
                options    = {};
            
            if (cleanPath === SLASH)
                noJSONPath = SLASH;
            
            Util.log ('reading dir: "' + cleanPath + '";');
            
             /* если доступен localStorage и
              * в нём есть нужная нам директория -
              * читаем данные с него и
              * выходим
              * если стоит поле обязательной перезагрузки - 
              * перезагружаемся
              */ 
            if (!ret) {
                str = Storage.get(cleanPath);
                
                if (!str) 
                    ret = true;
                else {
                    json = Util.parseJSON(str);
                    CloudCmd.createFileTable(json);
                    setTitle();
                }
            }
            
            if (ret)
                DOM.getCurrentFileContent({
                    url         : fsPath,
                    dataType    : 'json',
                    success     : function(data) {
                        var str         = Util.stringifyJSON(data),
                            MAX_SIZE    = 50000;
                        
                        setTitle();
                        
                        CloudCmd.createFileTable(data);
                        Util.log(str.length);
                        
                        /* если размер данных не очень бошьой       *
                         * сохраняем их в кэше                      */
                        if (str.length < MAX_SIZE)
                            Storage.set(cleanPath, str);
                    }
                });
        };
        
        /**
         * Функция строит файловую таблицу
         * @param pJSON  - данные о файлах
         */
        this.createFileTable        = function(pJSON) {
            var files,
                panel           = DOM.getPanel(),
                /* getting current element if was refresh */
                lPath           = DOM.getCurrentDirPath(panel),
                
                lCurrent        = DOM.getCurrentFile(),
                lDir            = DOM.getCurrentDirName(),
                
                lName           = DOM.getCurrentName(lCurrent),
                wasRefresh      = lPath === pJSON.path,
                lFuncs          = [
                    CloudCmd.getFileTemplate,
                    CloudCmd.getPathTemplate,
                    CloudCmd.getLinkTemplate
                ];
            
            Util.asyncCall(lFuncs, function(pTemplate, pPathTemplate, pLinkTemplate) {
                /* очищаем панель */
                var n, found,
                    i = panel.childNodes.length;
                
                while(i--)
                    panel.removeChild(panel.lastChild);
                
                panel.innerHTML = CloudFunc.buildFromJSON(pJSON, pTemplate, pPathTemplate, pLinkTemplate);
                
                files = DOM.getFiles(panel);
                
                /* searching current file */
                if (wasRefresh) {
                    n = files.length;
                    
                    for (i = 0; i < n ; i++) {
                        var lVarCurrent = files[i],
                            lVarName    = DOM.getCurrentName(lVarCurrent);
                        
                        found = lVarName === lName;
                        
                        if (found) {
                            lCurrent    = files[i];
                            break;
                        }
                    }
                }
                if (!found) /* .. */
                    lCurrent = files[0];
                
                DOM.setCurrentFile(lCurrent);
                
                Listeners.changeLinks(panel.id);
                
                if (lName === '..' && lDir !== '/')
                    currentToParent(lDir);
            });
        };
        
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
                
                Util.exec(CloudCmd.loadDir(path));
            }
        };
        
    }
})(this, Util, DOM, CloudFunc);
