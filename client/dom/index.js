/* global CloudCmd */

'use strict';

const itype = require('itype/legacy');
const exec = require('execon');
const jonny = require('jonny/legacy');

const Util = require('../../common/util');
const callbackify = require('../../common/callbackify');

const Images = require('./images');
const load = require('./load');
const Files = require('./files');
const RESTful = require('./rest');
const IO = require('./io');
const Storage = require('./storage');
const Dialog = require('./dialog');

const currentFile = require('./current-file');
const DOMTree = require('./dom-tree');

const DOM = {
    ...DOMTree,
    ...currentFile,
    ...new CmdProto(),
};

const read = callbackify(async (...args) => {
    const [e, data] = await RESTful.read(...args);
    
    if (e)
        throw e;
    
    return data;
});

DOM.Images = Images;
DOM.load = load;
DOM.Files = Files;
DOM.RESTful = RESTful;
DOM.IO = IO;
DOM.Storage = Storage;
DOM.Dialog = Dialog;

module.exports = DOM;

DOM.uploadDirectory = require('./directory');
DOM.Buffer = require('./buffer');
DOM.Events = require('./events');

const loadRemote = require('./load-remote');
const selectByPattern = require('./select-by-pattern');

function CmdProto() {
    const CurrentInfo = {};
    
    const Cmd = this;
    const SELECTED_FILE = 'selected-file';
    const TabPanel = {
        'js-left'        : null,
        'js-right'       : null,
    };
    
    this.loadRemote = (name, options, callback) => {
        loadRemote(name, options, callback);
        return DOM;
    };
    
    this.loadSocket = function(callback) {
        DOM.loadRemote('socket', {
            name    : 'io',
        }, callback);
        
        return DOM;
    };
    
    /**
     * create new folder
     *
     */
    this.promptNewDir        = function() {
        promptNew('directory', '?dir');
    };
    
    /**
     * create new file
     *
     * @typeName
     * @type
     */
    this.promptNewFile = () => {
        promptNew('file');
    };
    
    async function promptNew(typeName, type) {
        const {Dialog} = DOM;
        const dir = DOM.getCurrentDirPath();
        const msg = 'New ' + typeName || 'File';
        const getName = () => {
            const name = DOM.getCurrentName();
            
            if (name === '..')
                return '';
            
            return name;
        };
        
        const name = getName();
        
        const [cancel, currentName] = await Dialog.prompt(msg, name);
        
        if (cancel)
            return;
        
        const path = (type) => {
            const result = dir + currentName;
            
            if (!type)
                return result;
            
            return result + type;
        };
        
        await RESTful.write(path(type));
        await CloudCmd.refresh({
            currentName,
        });
    }
    
    /**
     * get current direcotory name
     */
    this.getCurrentDirName = () => {
        const href = DOM.getCurrentDirPath()
            .replace(/\/$/, '');
        
        const substr  = href.substr(href, href.lastIndexOf('/'));
        const ret     = href.replace(substr + '/', '') || '/';
        
        return ret;
    };
    
    /**
     * get current direcotory path
     */
    this.getParentDirPath = (panel) => {
        const path = DOM.getCurrentDirPath(panel);
        const dirName = DOM.getCurrentDirName() + '/';
        const index = path.lastIndexOf(dirName);
        
        if (path !== '/')
            return path.slice(0, index);
        
        return path;
    };
    
    /**
     * get not current direcotory path
     */
    this.getNotCurrentDirPath = () => {
        const panel = DOM.getPanel({active: false});
        const path = DOM.getCurrentDirPath(panel);
        
        return path;
    };
    
    /**
     * get current file by name
     */
    this.getCurrentByName = (name, panel = CurrentInfo.panel) => {
        const dataName = 'js-file-' + btoa(encodeURI(name));
        const element = DOM.getByDataName(dataName, panel);
        
        return element;
    };
    
    /**
     * unified way to get selected files
     *
     * @currentFile
     */
    this.getSelectedFiles = () => {
        const panel = DOM.getPanel();
        const selected = DOM.getByClassAll(SELECTED_FILE, panel);
        
        return [...selected];
    };
    
    /*
     * unselect all files
     */
    this.unselectFiles = (files) => {
        files = files || DOM.getSelectedFiles();
        
        [...files].forEach(DOM.toggleSelectedFile);
    };
    
    /**
     * get all selected files or current when none selected
     *
     * @currentFile
     */
    this.getActiveFiles = () => {
        const current = DOM.getCurrentFile();
        const files = DOM.getSelectedFiles();
        const name = DOM.getCurrentName(current);
        
        if (!files.length && name !== '..')
            return [current];
        
        return files;
    };
    
    this.getCurrentDate = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const date = DOM
            .getByDataName('js-date', current)
            .textContent;
        
        return date;
    };
    
    /**
     * get size
     * @currentFile
     */
    this.getCurrentSize = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        /* если это папка - возвращаем слово dir вместо размера*/
        const size = DOM.getByDataName('js-size', current)
            .textContent
            .replace(/^<|>$/g, '');
        
        return size;
    };
    
    /**
     * get size
     * @currentFile
     */
    this.loadCurrentSize = callbackify(async (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const query = '?size';
        const link = DOM.getCurrentPath(current);
        
        Images.show.load();
        
        if (name === '..')
            return;
        
        const [, size] = await RESTful.read(link + query);
        
        DOM.setCurrentSize(size, current);
        Images.hide();
        
        return current;
    });
    
    /**
     * load hash
     * @callback
     * @currentFile
     */
    this.loadCurrentHash = (callback, currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const query = '?hash';
        const link = DOM.getCurrentPath(current);
        
        read(link + query, callback);
    };
    
    /**
     * load current modification time of file
     * @callback
     * @currentFile
     */
    this.loadCurrentTime = (callback, currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const query = '?time';
        const link = DOM.getCurrentPath(current);
        
        read(link + query, callback);
    };
    
    /**
     * set size
     * @currentFile
     */
    this.setCurrentSize = (size, currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const sizeElement = DOM.getByDataName('js-size', current);
        
        sizeElement.textContent = size;
    };
    
    /**
     * @currentFile
     */
    this.getCurrentMode = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const mode = DOM.getByDataName('js-mode', current);
        
        return mode.textContent;
    };
    
    /**
     * @currentFile
     */
    this.getCurrentOwner = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const owner = DOM.getByDataName('js-owner', current);
        
        return owner.textContent;
    };
    
    /**
     * unified way to get current file content
     *
     * @param callback
     * @param currentFile
     */
    this.getCurrentData = (callback, currentFile) => {
        let hash;
        const {Dialog} = DOM;
        const Info = DOM.CurrentInfo;
        const current = currentFile || DOM.getCurrentFile();
        const path = DOM.getCurrentPath(current);
        const isDir = DOM.isCurrentIsDir(current);
        
        const func = (error, data) => {
            const ONE_MEGABYTE = 1024 * 1024 * 1024;
            
            if (!error) {
                if (itype.object(data))
                    data = jonny.stringify(data);
                
                const {length} = data;
                
                if (hash && length < ONE_MEGABYTE)
                    DOM.saveDataToStorage(path, data, hash);
            }
            
            callback(error, data);
        };
        
        if (Info.name === '..') {
            Dialog.alert.noFiles();
            return callback(Error('No files selected!'));
        }
        
        if (isDir)
            return read(path, func);
        
        DOM.checkStorageHash(path, (error, equal, hashNew) => {
            if (error)
                return callback(error);
            
            if (equal)
                return DOM.getDataFromStorage(path, callback);
            
            hash = hashNew;
            read(path, func);
        });
    };
    
    /**
     * unified way to get RefreshButton
     */
    this.getRefreshButton = (panel) => {
        const currentPanel = panel || DOM.getPanel();
        const refresh = DOM.getByDataName('js-refresh', currentPanel);
        
        return refresh;
    };
    
    this.setCurrentByName = (name) => {
        const current = DOM.getCurrentByName(name);
        return DOM.setCurrentFile(current);
    };
    
    /**
     * select current file
     * @param currentFile
     */
    this.selectFile = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        
        current.classList.add(SELECTED_FILE);
        
        return Cmd;
    };
    
    this.unselectFile = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        
        current.classList.remove(SELECTED_FILE);
        
        return Cmd;
    };
    
    this.toggleSelectedFile = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const name = DOM.getCurrentName(current);
        
        if (name === '..')
            return Cmd;
        
        current.classList.toggle(SELECTED_FILE);
        
        return Cmd;
    };
    
    this.toggleAllSelectedFiles = () => {
        DOM.getAllFiles().map(DOM.toggleSelectedFile);
        
        return Cmd;
    };
    
    this.selectAllFiles = () => {
        DOM.getAllFiles().map(DOM.selectFile);
        
        return Cmd;
    };
    
    this.getAllFiles = () => {
        const panel = DOM.getPanel();
        const files = DOM.getFiles(panel);
        const name = DOM.getCurrentName(files[0]);
        
        const from = (a) => a === '..' ? 1 : 0;
        const i = from(name);
        
        return [...files].slice(i);
    };
    
    /**
     * open dialog with expand selection
     */
    this.expandSelection = () => {
        const msg = 'expand';
        const {files} = CurrentInfo;
        
        selectByPattern(msg, files);
    };
    
    /**
     * open dialog with shrink selection
     */
    this.shrinkSelection = () => {
        const msg = 'shrink';
        const {files} = CurrentInfo;
        
        selectByPattern(msg, files);
    };
    
    /**
     * setting history wrapper
     */
    this.setHistory = (data, title, url) => {
        const ret = window.history;
        const {prefix} = CloudCmd;
        
        url = prefix + url;
        
        if (ret)
            history.pushState(data, title, url);
        
        return ret;
    };
    
    /**
     * selected file check
     *
     * @param currentFile
     */
    this.isSelected = (selected) => {
        if (!selected)
            return false;
        
        return DOM.isContainClass(selected, SELECTED_FILE);
    };
    
    /**
     * check is current file is a directory
     *
     * @param currentFile
     */
    this.isCurrentIsDir = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const fileType = DOM.getByDataName('js-type', current);
        
        return DOM.isContainClass(fileType, [
            'directory',
            'directory-link',
        ]);
    };
    
    /**
     * get link from current (or param) file
     *
     * @param currentFile - current file by default
     */
    this.getCurrentLink = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const link = DOM.getByTag('a', current);
        
        return link[0];
    };
    
    this.getFilenames = (files) => {
        if (!files)
            throw Error('AllFiles could not be empty');
        
        const first = files[0] || DOM.getCurrentFile();
        const name = DOM.getCurrentName(first);
        
        const allFiles = [...files];
        
        if (name === '..')
            allFiles.shift();
        
        const names = allFiles.map((current) => {
            return DOM.getCurrentName(current);
        });
        
        return names;
    };
    
    /**
     * check storage hash
     */
    this.checkStorageHash = (name, callback) => {
        const {parallel} = exec;
        const nameHash = name + '-hash';
        const getStoreHash = exec.with(Storage.get, nameHash);
        
        if (typeof name !== 'string')
            throw Error('name should be a string!');
        
        if (typeof callback !== 'function')
            throw Error('callback should be a function!');
        
        parallel([DOM.loadCurrentHash, getStoreHash], (error, loadHash, storeHash) => {
            let equal;
            const isContain = /error/.test(loadHash);
            
            if (isContain)
                error = loadHash;
            else if (loadHash === storeHash)
                equal = true;
            
            callback(error, equal, loadHash);
        });
    };
    
    /**
     * save data to storage
     *
     * @param name
     * @param data
     * @param hash
     * @param callback
     */
    this.saveDataToStorage = function(name, data, hash, callback) {
        const isDir = DOM.isCurrentIsDir();
        const nameHash = name + '-hash';
        const nameData = name + '-data';
        
        if (isDir)
            return exec(callback);
        
        exec.if(hash, () => {
            Storage.set(nameHash, hash);
            Storage.set(nameData, data);
            
            exec(callback, hash);
        }, (callback) => {
            DOM.loadCurrentHash((error, loadHash) => {
                hash = loadHash;
                callback();
            });
        });
    };
    
    /**
     * save data to storage
     *
     * @param name
     * @param data
     * @param callback
     */
    this.getDataFromStorage = (name, callback) => {
        const nameHash = name + '-hash';
        const nameData = name + '-data';
        const isDir = DOM.isCurrentIsDir();
        
        if (isDir)
            return exec(callback);
        
        exec.parallel([
            exec.with(Storage.get, nameData),
            exec.with(Storage.get, nameHash),
        ], callback);
    };
    
    this.getFM = () => {
        return DOM.getPanel().parentElement;
    };
    
    this.getPanelPosition = (panel) => {
        panel = panel || DOM.getPanel();
        
        return panel.dataset.name.replace('js-', '');
    };
    
    /** function getting panel active, or passive
     * @param options = {active: true}
     */
    this.getPanel = (options) => {
        let files;
        let panel;
        let isLeft;
        let dataName = 'js-';
        
        const current = DOM.getCurrentFile();
        
        if (!current) {
            panel = DOM.getByDataName('js-left');
        } else {
            files = current.parentElement;
            panel = files.parentElement;
            isLeft = panel.getAttribute('data-name') === 'js-left';
        }
        
        /* if {active : false} getting passive panel */
        if (options && !options.active) {
            dataName += isLeft ? 'right' : 'left';
            panel = DOM.getByDataName(dataName);
        }
        
        /* if two panels showed
         * then always work with passive
         * panel
         */
        if (window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH)
            panel = DOM.getByDataName('js-left');
        
        if (!panel)
            throw Error('can not find Active Panel!');
        
        return panel;
    };
    
    this.getFiles = (element) => {
        const files = DOM.getByDataName('js-files', element);
        return files.children || [];
    };
    
    /**
     * shows panel right or left (or active)
     */
    this.showPanel = (active) => {
        const panel = DOM.getPanel({active});
        
        if (!panel)
            return false;
        
        DOM.show(panel);
        
        return true;
    };
    
    /**
     * hides panel right or left (or active)
     */
    this.hidePanel = (active) => {
        const panel = DOM.getPanel({
            active,
        });
        
        if (!panel)
            return false;
        
        return DOM.hide(panel);
    };
    
    /**
     * remove child of element
     * @param pChild
     * @param element
     */
    this.remove = (child, element) => {
        const parent = element || document.body;
        
        parent.removeChild(child);
        
        return DOM;
    };
    
    /**
     * remove current file from file table
     * @param current
     *
     */
    this.deleteCurrent = (current) => {
        if (!current)
            DOM.getCurrentFile();
        
        const parent = current && current.parentElement;
        const name = DOM.getCurrentName(current);
        
        if (current && name !== '..') {
            const next = current.nextSibling;
            const prev = current.previousSibling;
            
            DOM.setCurrentFile(next || prev);
            parent.removeChild(current);
        }
    };
    
    /**
     * remove selected files from file table
     * @Selected
     */
    this.deleteSelected = (selected) => {
        selected = selected || DOM.getSelectedFiles();
        
        if (!selected)
            return;
        
        selected.map(DOM.deleteCurrent);
    };
    
    /**
     * rename current file
     *
     * @currentFile
     */
    this.renameCurrent = async (current) => {
        const {Dialog} = DOM;
        
        if (!DOM.isCurrentFile(current))
            current = DOM.getCurrentFile();
        
        const from = DOM.getCurrentName(current);
        
        if (from === '..')
            return Dialog.alert.noFiles();
        
        const [cancel, to] = await Dialog.prompt('Rename', from);
        
        if (cancel)
            return;
        
        const isExist = !!DOM.getCurrentByName(to);
        const dirPath = DOM.getCurrentDirPath();
        
        if (from === to)
            return;
        
        const files = {
            from : dirPath + from,
            to : dirPath + to,
        };
        
        const [e] = await RESTful.mv(files);
        
        if (e)
            return;
        
        DOM.setCurrentName(to, current);
        Storage.remove(dirPath);
        
        if (isExist)
            CloudCmd.refresh();
    };
    
    /**
     * unified way to scrollIntoViewIfNeeded
     * (native suporte by webkit only)
     * @param element
     * @param center - to scroll as small as possible param should be false
     */
    this.scrollIntoViewIfNeeded = function(element, center = false) {
        if (!element || !element.scrollIntoViewIfNeeded)
            return;
        
        element.scrollIntoViewIfNeeded(center);
    };
    
    /* scroll on one page */
    this.scrollByPages = (element, pPages) => {
        const ret = element && element.scrollByPages && pPages;
        
        if (ret)
            element.scrollByPages(pPages);
        
        return ret;
    };
    
    this.changePanel = () => {
        const Info = CurrentInfo;
        let panel = DOM.getPanel();
        
        CloudCmd.emit('passive-dir', Info.dirPath);
        
        const panelPassive = DOM.getPanel({
            active: false,
        });
        
        let name = DOM.getCurrentName();
        const filesPassive = DOM.getFiles(panelPassive);
        
        let dataName = panel.getAttribute('data-name');
        
        TabPanel[dataName] = name;
        
        panel = panelPassive;
        dataName = panel.getAttribute('data-name');
        
        name = TabPanel[dataName];
        
        let files;
        let current;
        
        if (name) {
            current = DOM.getCurrentByName(name, panel);
            
            if (current)
                files = current.parentElement;
        }
        
        if (!files || !files.parentElement) {
            current = DOM.getCurrentByName(name, panel);
            
            if (!current)
                [current] = filesPassive;
        }
        
        DOM.setCurrentFile(current, {
            history: true,
        });
        
        CloudCmd.emit('active-dir', Info.dirPath);
        
        return DOM;
    };
    
    this.getPackerExt = (type) => {
        if (type === 'zip')
            return '.zip';
        
        return '.tar.gz';
    };
    
    this.goToDirectory = async () => {
        const msg = 'Go to directory:';
        const {Dialog} = DOM;
        const {dirPath} = CurrentInfo;
        
        const [
            cancel,
            path = dirPath,
        ] = await Dialog.prompt(msg, path);
        
        if (cancel)
            return;
        
        CloudCmd.loadDir({
            path,
        });
    };
    
    this.duplicatePanel = () => {
        const Info = CurrentInfo;
        const {isDir} = Info;
        const panel = Info.panelPassive;
        const noCurrent = !Info.isOnePanel;
        
        const getPath = (isDir) => {
            if (isDir)
                return Info.path;
            
            return Info.dirPath;
        };
        
        const path = getPath(isDir);
        
        CloudCmd.loadDir({
            path,
            panel,
            noCurrent,
        });
    };
    
    this.swapPanels = () => {
        const Info = CurrentInfo;
        const {
            panel,
            files,
            element,
            panelPassive,
        } = Info;
        
        const dirPath = DOM.getCurrentDirPath();
        const dirPathPassive = DOM.getNotCurrentDirPath();
        
        let currentIndex = files.indexOf(element);
        
        CloudCmd.loadDir({
            path: dirPath,
            panel: panelPassive,
            noCurrent: true,
        });
        
        CloudCmd.loadDir({
            path: dirPathPassive,
            panel,
        }, () => {
            const {files} = Info;
            const length = files.length - 1;
            
            if (currentIndex > length)
                currentIndex = length;
            
            const el = files[currentIndex];
            
            DOM.setCurrentFile(el);
        });
    };
    
    this.CurrentInfo = CurrentInfo;
    
    this.updateCurrentInfo = (currentFile) => {
        const info = DOM.CurrentInfo;
        const current = currentFile || DOM.getCurrentFile();
        const files = current.parentElement;
        const panel = files.parentElement || DOM.getPanel();
        
        const panelPassive = DOM.getPanel({
            active: false,
        });
        
        const filesPassive = DOM.getFiles(panelPassive);
        const name = DOM.getCurrentName(current);
        
        /* eslint no-multi-spaces:0 */
        
        info.dir            = DOM.getCurrentDirName();
        info.dirPath        = DOM.getCurrentDirPath();
        info.parentDirPath  = DOM.getParentDirPath();
        info.element        = current;
        info.ext            = Util.getExt(name);
        info.files          = [...files.children];
        info.filesPassive   = [...filesPassive];
        info.first          = files.firstChild;
        info.getData        = DOM.getCurrentData;
        info.last           = files.lastChild;
        info.link           = DOM.getCurrentLink(current);
        info.mode           = DOM.getCurrentMode(current);
        info.name           = name;
        info.path           = DOM.getCurrentPath(current);
        info.panel          = panel;
        info.panelPassive   = panelPassive;
        info.size           = DOM.getCurrentSize(current);
        info.isDir          = DOM.isCurrentIsDir();
        info.isSelected     = DOM.isSelected(current);
        info.panelPosition  = DOM.getPanel().dataset.name.replace('js-', '');
        info.isOnePanel     =
            info.panel.getAttribute('data-name') ===
            info.panelPassive.getAttribute('data-name');
    };
}

