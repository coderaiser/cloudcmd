'use strict';

const itype = require('itype/legacy');
const rendy = require('rendy');

/* global Util, DOM, CloudFunc, join */

module.exports = new CloudCmdProto(Util, DOM, CloudFunc);

function CloudCmdProto(Util, DOM, CloudFunc) {
    let Key;
    let Debug;
    let Listeners;
    
    const log = (str) => {
        if (!Debug)
            return;
        
        console.log(str);
    };
    
    const CloudCmd = this;
    const Images = DOM.Images;
    const Info = DOM.CurrentInfo;
    const Storage = DOM.Storage;
    const Files = DOM.Files;
    
    this.log = log;
    this.PREFIX = '';
    this.PREFIX_URL = '';
    this.DIRCLIENT = '/dist/';
    this.MIN_ONE_PANEL_WIDTH    = 1155;
    this.HOST                   = location.origin ||
                                  location.protocol + '//' + location.host;
    
    const TITLE = 'Cloud Commander';
    this.TITLE = TITLE;
    
    this.sort = {
        left: 'name',
        right: 'name',
    };
    
    this.order = {
        left: 'asc',
        right: 'asc',
    };
    
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
        var p = params;
        
        var isRefresh       = p.isRefresh;
        var panel           = p.panel;
        var history         = p.history;
        var noCurrent       = p.noCurrent;
        
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
            refresh: isRefresh,
            history: history,
            noCurrent: noCurrent
        }, panel, callback);
    };
    
    /**
     * function load modules
     * @params = {name, path, func, dobefore, arg}
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
                CloudCmd[name] = (...args) => {
                    const prefix = CloudCmd.PREFIX;
                    const pathFull = prefix + CloudCmd.DIRCLIENT + path;
                    
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
    
    /**
     * Конструктор CloudClient, который
     * выполняет весь функционал по
     * инициализации
     */
    this.init = (prefix, config) => {
        const func = () => {
            Util.exec.series([
                initModules,
                baseInit,
                loadPlugins,
                () => {
                    CloudCmd.route(location.hash);
                }
            ]);
        };
        
        const funcBefore  = (callback) => {
            const src = prefix + '/join:' + [
                CloudCmd.DIRCLIENT + 'polyfill.js',
                '/modules/domtokenlist-shim/dist/domtokenlist.min.js',
            ].join(':');
            
            DOM.loadJquery(() => {
                DOM.load.js(src, callback);
            });
        };
        
        CloudCmd.PREFIX = prefix;
        CloudCmd.PREFIX_URL = prefix + CloudFunc.apiURL;
        
        CloudCmd.config = (key) => config[key];
        CloudCmd._config = (key, value) => {
            /*
             * should be called from config.js only
             * after successful update on server
             */
            config[key] = value;
        };
        
        if (config.onePanelMode)
            CloudCmd.MIN_ONE_PANEL_WIDTH = Infinity;
        
        Util.exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
    };
    
    function loadPlugins(callback) {
        const prefix = CloudCmd.PREFIX;
        const plugins = prefix + '/plugins.js';
        
        DOM.load.js(plugins, callback);
    }
    
    this.join = (urls) => {
        const prefix  = CloudCmd.PREFIX;
        
        if (!Array.isArray(urls))
            throw Error('urls should be array!');
        
        const noPrefixUrls = urls.map((url) => {
            return url.replace(prefix, '');
        });
        
        return prefix + join(noPrefixUrls);
    };
    
    this.route = (path) => {
        const query = path.split('/');
        
        if (!path)
            return;
        
        let [module] = query;
        
        module = module.slice(1);
        module = getStrBigFirst(module);
        
        const file = query[1];
        const current = DOM.getCurrentByName(file);
        
        if (file && !current) {
            const msg = CloudFunc.formatMsg('set current file', file, 'error');
            CloudCmd.log(msg);
            return;
        }
        
        DOM.setCurrentFile(current);
        CloudCmd.execFromModule(module, 'show');
    };
    
    this.logOut = () => {
        const url = CloudCmd.PREFIX + '/logout';
        const error = () => document.location.reload();
        
        DOM.load.ajax({url, error});
    };
    
    function initModules(callback) {
        Util.exec.if(CloudCmd.Key, () => {
            Key = new CloudCmd.Key();
            CloudCmd.Key = Key;
            Key.bind();
        }, (func) => {
            /* привязываем клавиши к функциям */
            const path = 'key.js';
            
            loadModule({
                path,
                func
            });
        });
        
        Files.get('modules', (error, modules) => {
            const STORAGE = 'storage';
            const showLoad = Images.show.load;
            
            const doBefore = {
                'edit'                  : showLoad,
                'menu'                  : showLoad,
                'storage/_filepicker'   : showLoad
            };
            
            const load = (name, path, dobefore) => {
                const isTmpl = path === 'template';
                const funcName = isTmpl ? 'get' : 'show';
                
                loadModule({
                    name,
                    path,
                    dobefore,
                    funcName,
                });
            };
            
            if (!modules)
                modules = [];
            
            modules.forEach((module) => {
                const isStr = itype.string(module);
                
                if (!isStr)
                    return;
                
                load(null, module, doBefore[module]);
            });
            
            const storageObj = Util.findObjByNameInArr(modules, STORAGE);
            const mod = Util.getNamesFromObjArray(storageObj);
            
            mod.forEach((name) => {
                const path = STORAGE + '/_' + name.toLowerCase();
                
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
    
    this.refresh =  function(panelParam, options, callback) {
        var panel = panelParam || Info.panel;
        var NEEDREFRESH = true;
        var path = DOM.getCurrentDirPath(panel);
        var noCurrent;
        
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
                return createFileTable(obj, panel, options, callback);
            
            var position = DOM.getPanelPosition(panel);
            var sort = CloudCmd.sort[position];
            var order = CloudCmd.order[position];
            
            var query = rendy('?sort={{ sort }}&order={{ order }}', {
                sort: sort,
                order: order,
            });
            
            RESTful.read(path + query, 'json', function(error, obj) {
                if (error)
                    return;
                
                Storage.set(path, obj);
                
                options.sort = sort;
                options.order = order;
                
                createFileTable(obj, panel, options, function() {
                    if (isRefresh && !noCurrent) {
                        DOM.setCurrentByName(name);
                    }
                    
                    Util.exec(callback);
                });
            });
        };
        
        if (!options)
            options    = {};
        
        CloudCmd.log('reading dir: "' + path + '";');
        
        if (!CloudCmd.config('dirStorage'))
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
            
            if (error)
                return Dialog.alert(TITLE, error.responseText);
                
            childNodes  = panel.childNodes;
            i           = childNodes.length;
            
            while (i--)
                panel.removeChild(panel.lastChild);
            
            panel.innerHTML = CloudFunc.buildFromJSON({
                sort        : options.sort,
                order       : options.order,
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

