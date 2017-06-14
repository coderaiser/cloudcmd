'use strict';

const itype = require('itype/legacy');
const rendy = require('rendy');
const exec = require('execon');
const Images = require('./dom/images');
const join = require('join-io/www/join');
const jonny = require('jonny');

const {
    apiURL,
    formatMsg,
    buildFromJSON,
} = require('../common/cloudfunc');

/* global Util, DOM */

module.exports = new CloudCmdProto(Util, DOM);

function CloudCmdProto(Util, DOM) {
    let Key;
    let Debug;
    let Listeners;
    
    const log = (str) => {
        if (!Debug)
            return;
        
        console.log(str);
    };
    
    const CloudCmd = this;
    const Info = DOM.CurrentInfo;
    const Storage = DOM.Storage;
    const Files = DOM.Files;
    
    this.log = log;
    this.PREFIX = '';
    this.PREFIX_URL = '';
    this.DIRCLIENT = '/dist/';
    this.DIRCLIENT_MODULES = this.DIRCLIENT + 'modules/';
    
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
    
    log.enable = () => {
        Debug = true;
    };
    
    log.disable = () => {
        Debug = false;
    };
    
    const kebabToCamelCase = Util.kebabToCamelCase;
    
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
    this.loadDir = (params, callback) => {
        const p = params;
        
        const refresh = p.isRefresh;
        const panel = p.panel;
        const history = p.history;
        const noCurrent = p.noCurrent;
        const currentName = p.currentName;
        
        let panelChanged;
        if (!noCurrent)
            if (panel && panel !== Info.panel) {
                DOM.changePanel();
                panelChanged = true;
            }
        
        let imgPosition;
        if (panelChanged || refresh || !history)
            imgPosition = 'top';
        
        Images.show.load(imgPosition, panel);
        
        /* загружаем содержимое каталога */
        ajaxLoad(p.path, {
            refresh,
            history,
            noCurrent,
            currentName,
        }, panel, callback);
    };
    
    /**
     * function load modules
     * @params = {name, path, func, dobefore, arg}
     */
    function loadModule(params) {
        if (!params)
            return;
        
        let path = params.path;
        const name = params.name || path && kebabToCamelCase(path);
        const func = params.func;
        const funcName = params.funcName;
        const doBefore = params.dobefore;
        
        const isContain = /\.js/.test(path);
        
        if (!isContain)
            path += '.js';
        
        if (CloudCmd[name])
            return;
        
        CloudCmd[name] = (...args) => {
            const prefix = CloudCmd.PREFIX;
            const pathFull = prefix + CloudCmd.DIRCLIENT_MODULES + path;
            
            exec(doBefore);
            
            return DOM.load.js(pathFull, func ||
                function(error) {
                    var Proto = CloudCmd[name];
                    
                    if (!error && itype.function(Proto))
                        CloudCmd[name] = applyConstructor(Proto, args);
                });
        };
        
        CloudCmd[name][funcName] = CloudCmd[name];
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
            exec.series([
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
                CloudCmd.DIRCLIENT_MODULES + 'polyfill.js',
                '/modules/domtokenlist-shim/dist/domtokenlist.min.js',
            ].join(':');
            
            DOM.loadJquery(() => {
                DOM.load.js(src, callback);
            });
        };
        
        CloudCmd.PREFIX = prefix;
        CloudCmd.PREFIX_URL = prefix + apiURL;
        
        CloudCmd.config = (key) => config[key];
        CloudCmd._config = (key, value) => {
            /*
             * should be called from config.js only
             * after successful update on server
             */
            config[key] = value;
        };
        
        DOM.Storage.setAllowed(CloudCmd.config('localStorage'));
        
        if (config.onePanelMode)
            CloudCmd.MIN_ONE_PANEL_WIDTH = Infinity;
        
        exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
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
        
        const [kebabModule] = query;
        const module = kebabToCamelCase(kebabModule.slice(1));
        
        const file = query[1];
        const current = DOM.getCurrentByName(file);
        
        if (file && !current) {
            const msg = formatMsg('set current file', file, 'error');
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
        exec.if(CloudCmd.Key, () => {
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
            const showLoad = Images.show.load;
            
            const doBefore = {
                'edit': showLoad,
                'menu': showLoad,
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
            
            modules.local.forEach((module) => {
                load(null, module, doBefore[module]);
            });
            
            callback();
        });
    }
    
    function baseInit(callback) {
        const files = DOM.getFiles();
        
        /* выделяем строку с первым файлом */
        if (files)
            DOM.setCurrentFile(files[0], {
                // when hash is present
                // it should be handled with this.route
                // overwre otherwise
                history: !location.hash
            });
        
        const dirPath = DOM.getCurrentDirPath();
        Listeners = CloudCmd.Listeners;
        Listeners.init();
        
        const panels = getPanels();
        panels.forEach(Listeners.setOnPanel);
        
        Listeners.initKeysPanel();
        
        Storage.get(dirPath, (error, data) => {
            if (!data) {
                data = getJSONfromFileTable();
                Storage.set(dirPath, data);
            }
        });
        
        callback();
    }
    
    function getPanels() {
        const panels = ['left'];
        
        if (CloudCmd.config('onePanelMode'))
            return panels;
        
        return [
            ...panels,
            'right',
        ];
    }
    
    this.execFromModule = (moduleName, funcName, ...args) => {
        const obj = CloudCmd[moduleName];
        const isObj = itype.object(obj);
        
        exec.if(isObj, () => {
            const obj = CloudCmd[moduleName];
            const func = obj[funcName];
            
            func(...args);
        }, obj);
    };
    
    this.refresh = (options = {}, callback) => {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }
       
        const panel = options.panel || Info.panel;
        const path = DOM.getCurrentDirPath(panel);
        
        const isRefresh = true;
        const history = false;
        const noCurrent = options ? options.noCurrent : false;
        const currentName = options.currentName;
        
        CloudCmd.loadDir({
            path,
            isRefresh,
            history,
            panel,
            noCurrent,
            currentName,
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
        const create = (error, json) => {
            const RESTful = DOM.RESTful;
            const name = options.currentName || Info.name;
            const obj = jonny.parse(json);
            const isRefresh = options.refresh;
            const noCurrent = options.noCurrent;
            
            if (!isRefresh && json)
                return createFileTable(obj, panel, options, callback);
            
            const position = DOM.getPanelPosition(panel);
            const sort = CloudCmd.sort[position];
            const order = CloudCmd.order[position];
            
            const query = rendy('?sort={{ sort }}&order={{ order }}', {
                sort,
                order,
            });
            
            RESTful.read(path + query, 'json', (error, obj) => {
                if (error)
                    return;
                
                Storage.set(path, obj);
                
                options.sort = sort;
                options.order = order;
                
                createFileTable(obj, panel, options, () => {
                    if (isRefresh && !noCurrent)
                        DOM.setCurrentByName(name);
                    
                    exec(callback);
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
            
            panel.innerHTML = buildFromJSON({
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
            
            exec(callback);
        });
    }
    
    /**
     * Функция генерирует JSON из html-таблицы файлов и
     * используеться при первом заходе в корень
     */
    function getJSONfromFileTable() {
        const path = DOM.getCurrentDirPath();
        const infoFiles = Info.files || [];
        
        const notParent = (current) => {
            const name = DOM.getCurrentName(current);
            return name !== '..';
        };
        
        const parse = (current) => {
            const name = DOM.getCurrentName(current);
            const size = DOM.getCurrentSize(current);
            const owner = DOM.getCurrentOwner(current);
            const mode = DOM.getCurrentMode(current);
            const date = DOM.getCurrentDate(current);
            
            return {
                name,
                size,
                mode,
                owner,
                date,
            };
        };
        
        const files = infoFiles
            .filter(notParent)
            .map(parse);
        
        const fileTable = {
            path,
            files,
        };
        
        return fileTable;
    }
    
    this.goToParentDir = () => {
        let path = Info.dirPath;
        const dir = Info.dir;
        const parentPath = Info.parentDirPath;
        
        if (path === Info.parentDirPath)
            return;
        
        path = parentPath;
        
        CloudCmd.loadDir({path}, () => {
            const panel = Info.panel;
            let current = DOM.getCurrentByName(dir);
            
            if (!current)
                current = DOM.getFiles(panel)[0];
            
            DOM.setCurrentFile(current, {
                history
            });
        });
    };
}

