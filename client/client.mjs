import process from 'node:process';

/* global DOM */
import Emitify from 'emitify';
import inherits from 'inherits';
import rendy from 'rendy';
import load from 'load.js';
import {tryToCatch} from 'try-to-catch';
import {addSlashToEnd} from 'format-io';
import pascalCase from 'just-pascal-case';
import currify from 'currify';
import * as Images from './dom/images.mjs';
import {unregisterSW} from './sw/register.mjs';
import {getJsonFromFileTable} from './get-json-from-file-table.mjs';
import {Key} from './key/index.mjs';
import {
    apiURL,
    formatMsg,
    buildFromJSON,
} from '../common/cloudfunc.mjs';
import {loadModule} from './load-module.mjs';

const noJS = (a) => a.replace(/.js$/, '');

const isDev = process.env.NODE_ENV === 'development';

inherits(CloudCmdProto, Emitify);

export const createCloudCmd = ({DOM, Listeners}) => {
    return new CloudCmdProto({
        DOM,
        Listeners,
    });
};

load.addErrorListener((e, src) => {
    const msg = `file ${src} could not be loaded`;
    Images.show.error(msg);
});

function CloudCmdProto({DOM, Listeners}) {
    Emitify.call(this);
    
    const CloudCmd = this;
    const Info = DOM.CurrentInfo;
    
    const {Storage, Files} = DOM;
    
    this.log = () => {
        if (!isDev)
            return;
    };
    this.prefix = '';
    this.prefixSocket = '';
    this.prefixURL = '';
    
    this.MIN_ONE_PANEL_WIDTH = DOM.getCSSVar('min-one-panel-width');
    this.HOST = location.origin || location.protocol + '//' + location.host;
    this.sort = {
        left: 'name',
        right: 'name',
    };
    
    this.order = {
        left: 'asc',
        right: 'asc',
    };
    
    this.changeDir = async (path, overrides = {}) => {
        const {
            isRefresh,
            panel,
            history = true,
            noCurrent,
            currentName,
        } = overrides;
        
        const refresh = isRefresh;
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
        await ajaxLoad(addSlashToEnd(path), {
            refresh,
            history,
            noCurrent,
            currentName,
            showDotFiles: CloudCmd.config('showDotFiles'),
        }, panel);
    };
    
    /**
     * Конструктор CloudClient, который
     * выполняет весь функционал по
     * инициализации
     */
    this.init = async (prefix, config) => {
        CloudCmd.prefix = prefix;
        CloudCmd.prefixURL = `${prefix}${apiURL}`;
        CloudCmd.prefixSocket = config.prefixSocket;
        CloudCmd.DIR_DIST = `${prefix}/dist`;
        CloudCmd.DIR_MODULES = `${this.DIR_DIST}/modules`;
        
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
        
        if (!document.body.scrollIntoViewIfNeeded)
            await load.js(`${CloudCmd.DIR_MODULES}/polyfill.js`);
        
        await initModules();
        await baseInit();
        
        CloudCmd.route(location.hash);
    };
    
    this.route = (path) => {
        const query = path.split('/');
        
        if (!path)
            return;
        
        const [kebabModule] = query;
        const module = noJS(pascalCase(kebabModule.slice(1)));
        
        const [, file] = query;
        const current = DOM.getCurrentByName(file);
        
        if (file && !current) {
            const msg = formatMsg('set current file', file, 'error');
            CloudCmd.log(msg);
            
            return;
        }
        
        DOM.setCurrentFile(current);
        CloudCmd.execFromModule(module, 'show');
    };
    
    this.logOut = async () => {
        const url = CloudCmd.prefix + '/logout';
        const error = () => document.location.reload();
        const {prefix} = CloudCmd;
        
        await DOM.Storage.clear();
        unregisterSW(prefix);
        DOM.load.ajax({
            url,
            error,
        });
    };
    
    const initModules = async () => {
        CloudCmd.Key = Key;
        CloudCmd.Key.bind();
        
        const [, modules] = await tryToCatch(Files.get, 'modules');
        const showLoad = Images.show.load;
        
        const doBefore = {
            edit: showLoad,
            menu: showLoad,
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
    };
    
    async function saveCurrentName(currentName) {
        await Storage.set('current-name', currentName);
    }
    
    async function baseInit() {
        const files = DOM.getFiles();
        
        CloudCmd.on('current-file', DOM.updateCurrentInfo);
        CloudCmd.on('current-name', saveCurrentName);
        
        const name = await Storage.get('current-name');
        const currentFile = name && DOM.getCurrentByName(name) || files[0];
        
        /* выделяем строку с первым файлом */
        if (files)
            DOM.setCurrentFile(currentFile, {
                // when hash is present
                // it should be handled with this.route
                // overwre otherwise
                history: !location.hash,
            });
        
        const dirPath = DOM.getCurrentDirPath();
        
        Listeners.init();
        
        const panels = getPanels();
        panels.forEach(Listeners.setOnPanel);
        
        Listeners.initKeysPanel();
        
        if (!CloudCmd.config('dirStorage'))
            return;
        
        const data = await Storage.get(dirPath);
        
        if (!data)
            await Storage.setJson(dirPath, getJsonFromFileTable());
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
    
    this.refresh = async (options = {}) => {
        const {panel = Info.panel, currentName} = options;
        
        const path = DOM.getCurrentDirPath(panel);
        
        const isRefresh = true;
        const history = false;
        const noCurrent = options?.noCurrent;
        
        await CloudCmd.changeDir(path, {
            isRefresh,
            history,
            panel,
            noCurrent,
            currentName,
        });
    };
    
    /**
     * Функция загружает json-данные о Файловой Системе
     * через ajax-запрос.
     * @param path - каталог для чтения
     * @param options
     * { refresh, history } - необходимость обновить данные о каталоге
     * @param panel
     *
     */
    async function ajaxLoad(path, options = {}, panel) {
        const {RESTful} = DOM;
        
        CloudCmd.log(`reading dir: "${path}";`);
        
        const dirStorage = CloudCmd.config('dirStorage');
        const json = dirStorage && await Storage.getJson(path);
        
        const name = options.currentName || Info.name;
        const {noCurrent, refresh} = options;
        
        if (!refresh && json)
            return await createFileTable(json, panel, options);
        
        const position = DOM.getPanelPosition(panel);
        const sort = CloudCmd.sort[position];
        const order = CloudCmd.order[position];
        
        const query = rendy('?sort={{ sort }}&order={{ order }}', {
            sort,
            order,
        });
        
        const [, newObj] = await RESTful.read(path + query, 'json');
        
        if (!newObj)
            // that's OK, error handled by RESTful
            return;
        
        options.sort = sort;
        options.order = order;
        
        await createFileTable(newObj, panel, options);
        
        if (refresh && !noCurrent)
            DOM.setCurrentByName(name);
        
        if (!CloudCmd.config('dirStorage'))
            return;
        
        Storage.setJson(path, newObj);
    }
    
    /**
     * Функция строит файловую таблицу
     * @param data - данные о файлах
     * @param panelParam
     * @param options - history, noCurrent, showDotFiles
     */
    async function createFileTable(data, panelParam, options) {
        const {
            history,
            noCurrent,
            showDotFiles,
        } = options;
        
        const names = [
            'file',
            'path',
            'link',
            'pathLink',
        ];
        
        const [error, [file, path, link, pathLink]] = await tryToCatch(Files.get, names);
        
        if (error)
            return DOM.Dialog.alert(error.responseText);
        
        const panel = panelParam || DOM.getPanel();
        const {prefix} = CloudCmd;
        
        const {dir, name} = Info;
        
        const {childNodes} = panel;
        let i = childNodes.length;
        
        while (i--)
            panel.removeChild(panel.lastChild);
        
        panel.innerHTML = buildFromJSON({
            sort: options.sort,
            order: options.order,
            data,
            id: panel.id,
            prefix,
            showDotFiles,
            template: {
                file,
                path,
                pathLink,
                link,
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
    
    this.goToParentDir = async () => {
        const {
            dir,
            dirPath,
            parentDirPath,
            panel,
        } = Info;
        
        if (dirPath === parentDirPath)
            return;
        
        const path = parentDirPath;
        
        await CloudCmd.changeDir(path);
        
        const current = DOM.getCurrentByName(dir);
        const [first] = DOM.getFiles(panel);
        
        DOM.setCurrentFile(current || first, {
            history,
        });
    };
}
