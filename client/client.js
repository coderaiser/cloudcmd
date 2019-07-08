'use strict';

/* global DOM */

const Emitify = require('emitify/legacy');
const inherits = require('inherits');
const rendy = require('rendy/legacy');
const exec = require('execon');
const load = require('load.js');
const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');

const pascalCase = require('just-pascal-case');
const isDev = process.env.NODE_ENV === 'development';

const Images = require('./dom/images');
const {unregisterSW} = require('./sw/register');

const jonny = require('jonny/legacy');
const currify = require('currify/legacy');

const bind = (f, ...a) => () => f(...a);
const noop = () => {};
const noJS = (a) => a.replace(/.js$/, '');

const {
    apiURL,
    formatMsg,
    buildFromJSON,
} = require('../common/cloudfunc');

const callbackify = require('../common/callbackify');

const loadModule = require('./load-module');

inherits(CloudCmdProto, Emitify);

module.exports = new CloudCmdProto(DOM);

load.addErrorListener((e, src) => {
    const msg = `file ${src} could not be loaded`;
    Images.show.error(msg);
});

function CloudCmdProto(DOM) {
    let Key;
    let Listeners;
    
    const log = (...a) => {
        if (!isDev )
            return;
        
        console.log(...a);
    };
    
    Emitify.call(this);
    
    const CloudCmd = this;
    const Info = DOM.CurrentInfo;
    
    const {
        Storage,
        Files,
    } = DOM;
    
    this.log = log;
    this.prefix = '';
    this.prefixSocket = '';
    this.prefixURL = '';
    this.DIRCLIENT = '/dist/';
    this.DIRCLIENT_MODULES = this.DIRCLIENT + 'modules/';
    
    this.MIN_ONE_PANEL_WIDTH = 1155;
    this.HOST = location.origin ||
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
        
        const {
            panel,
            history,
            noCurrent,
            currentName,
        } = p;
        
        let panelChanged;
        
        if (!noCurrent && panel && panel !== Info.panel) {
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
     * Конструктор CloudClient, который
     * выполняет весь функционал по
     * инициализации
     */
    this.init = (prefix, config) => {
        const func = bind(exec.series, [
            initModules,
            baseInit,
            loadPlugins,
            loadStyle,
            exec.with(CloudCmd.route, location.hash),
        ], noop);
        
        const funcBefore = (callback) => {
            const src = prefix + CloudCmd.DIRCLIENT_MODULES + 'polyfill.js';
            load.js(src, callback);
        };
        
        CloudCmd.prefix = prefix;
        CloudCmd.prefixURL = `${prefix}${apiURL}`;
        CloudCmd.prefixSocket = config.prefixSocket;
        
        CloudCmd.config = (key) => config[key];
        CloudCmd.config.if = currify((key, fn, a) => config[key] && fn(a));
        CloudCmd._config = (key, value) => {
            /*
             * should be called from config.js only
             * after successful update on server
             */
            
            if (key === 'password')
                return;
            
            config[key] = value;
        };
        
        if (config.oneFilePanel)
            CloudCmd.MIN_ONE_PANEL_WIDTH = Infinity;
        
        exec.if(document.body.scrollIntoViewIfNeeded, func, funcBefore);
    };
    
    function loadStyle(callback) {
        const {prefix} = CloudCmd;
        const name = prefix + '/dist/cloudcmd.common.css';
        
        load.css(name, callback);
    }
    
    function loadPlugins(callback) {
        const {prefix} = CloudCmd;
        const plugins = prefix + '/plugins.js';
        
        load.js(plugins, callback);
    }
    
    this.route = (path) => {
        const query = path.split('/');
        
        if (!path)
            return;
        
        const [kebabModule] = query;
        const module = noJS(pascalCase(kebabModule.slice(1)));
        
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
        const url = CloudCmd.prefix + '/logout';
        const error = () => document.location.reload();
        const {prefix} = CloudCmd;
        
        DOM.Storage.clear();
        unregisterSW(prefix);
        DOM.load.ajax({
            url,
            error,
        });
    };
    
    const initModules = callbackify(async () => {
        exec.if(CloudCmd.Key, () => {
            Key = new CloudCmd.Key();
            CloudCmd.Key = Key;
            Key.bind();
        }, (func) => {
            /* привязываем клавиши к функциям */
            const path = 'key.js';
            
            loadModule({
                path,
                func,
            });
        });
        
        const [, modules] = await tryToCatch(Files.get, 'modules');
        const showLoad = Images.show.load;
        
        const doBefore = {
            'edit': showLoad,
            'menu': showLoad,
        };
        
        const load = (name, path, dobefore) => {
            loadModule({
                name,
                path,
                dobefore,
            });
        };
        
        if (!modules)
            return;
        
        for (const module of modules.local) {
            load(null, module, doBefore[module]);
        }
    });
    
    function baseInit(callback) {
        const files = DOM.getFiles();
        
        CloudCmd.on('current-file', DOM.updateCurrentInfo);
        
        /* выделяем строку с первым файлом */
        if (files)
            DOM.setCurrentFile(files[0], {
                // when hash is present
                // it should be handled with this.route
                // overwre otherwise
                history: !location.hash,
            });
        
        const dirPath = DOM.getCurrentDirPath();
        Listeners = CloudCmd.Listeners;
        Listeners.init();
        
        const panels = getPanels();
        panels.forEach(Listeners.setOnPanel);
        
        Listeners.initKeysPanel();
        
        if (!CloudCmd.config('dirStorage'))
            return callback();
        
        Storage.get(dirPath, (error, data) => {
            if (!data) {
                data = getJSONfromFileTable();
                Storage.set(dirPath, data);
            }
            callback();
        });
    }
    
    function getPanels() {
        const panels = ['left'];
        
        if (CloudCmd.config('oneFilePanel'))
            return panels;
        
        return [
            ...panels,
            'right',
        ];
    }
    
    this.execFromModule = async (moduleName, funcName, ...args) => {
        await CloudCmd[moduleName]();
        
        const func = CloudCmd[moduleName][funcName];
        func(...args);
    };
    
    this.refresh = promisify((options = {}, callback) => {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = {};
        }
        
        const {
            panel = Info.panel,
            currentName,
        } = options;
        const path = DOM.getCurrentDirPath(panel);
        
        const isRefresh = true;
        const history = false;
        const noCurrent = options ? options.noCurrent : false;
        
        CloudCmd.loadDir({
            path,
            isRefresh,
            history,
            panel,
            noCurrent,
            currentName,
        }, callback);
    });
    
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
        const create = async (error, json) => {
            const {RESTful} = DOM;
            const name = options.currentName || Info.name;
            const obj = jonny.parse(json);
            const isRefresh = options.refresh;
            const {noCurrent} = options;
            
            if (!isRefresh && json)
                return createFileTable(obj, panel, options, callback);
            
            const position = DOM.getPanelPosition(panel);
            const sort = CloudCmd.sort[position];
            const order = CloudCmd.order[position];
            
            const query = rendy('?sort={{ sort }}&order={{ order }}', {
                sort,
                order,
            });
            
            const [, newObj] = await RESTful.read(path + query, 'json');
            
            if (!newObj)
                return;
            
            /* eslint require-atomic-updates:0 */
            options.sort = sort;
            options.order = order;
            
            await createFileTable(newObj, panel, options);
            
            if (isRefresh && !noCurrent)
                DOM.setCurrentByName(name);
            
            exec(callback);
            
            if (!CloudCmd.config('dirStorage'))
                return;
            
            Storage.set(path, newObj);
        };
        
        if (!options)
            options = {};
        
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
    async function createFileTable(json, panelParam, options) {
        const {
            history,
            noCurrent,
        } = options;
        
        const names = ['file', 'path', 'link', 'pathLink'];
        
        const [
            error,
            [templFile, templPath, templLink, templPathLink],
        ] = await tryToCatch(Files.get, names);
        
        if (error)
            return DOM.Dialog.alert(error.responseText);
        
        const panel = panelParam || DOM.getPanel();
        const {prefix} = CloudCmd;
        
        const {
            dir,
            name,
        } = Info;
        
        const {childNodes} = panel;
        let i = childNodes.length;
        
        while (i--)
            panel.removeChild(panel.lastChild);
        
        panel.innerHTML = buildFromJSON({
            sort        : options.sort,
            order       : options.order,
            data        : json,
            id          : panel.id,
            prefix,
            template    : {
                file        : templFile,
                path        : templPath,
                pathLink    : templPathLink,
                link        : templLink,
            },
        });
        
        Listeners.setOnPanel(panel);
        
        if (!noCurrent) {
            let current;
            
            if (name === '..' && dir !== '/')
                current = DOM.getCurrentByName(dir);
            
            if (!current)
                [current] = DOM.getFiles(panel);
            
            DOM.setCurrentFile(current, {
                history,
            });
            
            CloudCmd.emit('active-dir', Info.dirPath);
        }
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
        const {
            dir,
            dirPath,
            parentDirPath,
        } = Info;
        
        if (dirPath === parentDirPath)
            return;
        
        const path = parentDirPath;
        
        CloudCmd.loadDir({path}, () => {
            const {panel} = Info;
            const current = DOM.getCurrentByName(dir);
            const [first] = DOM.getFiles(panel);
            
            DOM.setCurrentFile(current || first, {
                history,
            });
        });
    };
}

