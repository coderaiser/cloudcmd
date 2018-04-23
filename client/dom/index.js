/* global CloudCmd */

'use strict';

const itype = require('itype/legacy');
const exec = require('execon');
const jonny = require('jonny/legacy');
const Util = require('../../common/util');

const {
    getTitle,
    FS,
} = require('../../common/cloudfunc');

const {encode} = require('../../common/entity');

const DOMTree = require('./dom-tree');

const DOM = Object.assign({}, DOMTree, new CmdProto());

module.exports = DOM;

const Images = require('./images');
const load = require('./load');
const Files = require('./files');
const RESTful = require('./rest');
const Storage = require('./storage');

DOM.Images = Images;
DOM.load = load;
DOM.Files = Files;
DOM.RESTful = RESTful;
DOM.Storage = Storage;

DOM.uploadDirectory = require('./directory');
DOM.Buffer = require('./buffer');
DOM.Events = require('./events');

const loadRemote = require('./load-remote');
const selectByPattern = require('./select-by-pattern');

function CmdProto() {
    let Title;
    let CurrentInfo = {};
    
    const Cmd = this;
    const CURRENT_FILE = 'current-file';
    const SELECTED_FILE = 'selected-file';
    const TITLE = 'Cloud Commander';
    const TabPanel = {
        'js-left'        : null,
        'js-right'       : null
    };
    
    this.loadRemote = (name, options, callback) => {
        loadRemote(name, options, callback);
        return DOM;
    };
    /**
     * load jquery from google cdn or local copy
     * @param callback
     */
    this.loadJquery = function(callback) {
        DOM.loadRemote('jquery', {
            name    : '$'
        }, callback);
        
        return DOM;
    };
    
    this.loadSocket = function(callback) {
        DOM.loadRemote('socket', {
            name    : 'io'
        }, callback);
        
        return DOM;
    };
    
    /** function loads css and js of Menu
     * @param callback
     */
    this.loadMenu = function(callback) {
        return DOM.loadRemote('menu', callback);
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
    
    function promptNew(typeName, type) {
        const {Dialog} = DOM;
        const dir = Cmd.getCurrentDirPath();
        const msg = 'New ' + typeName || 'File';
        const getName = () => {
            const name = Cmd.getCurrentName();
            
            if (name === '..')
                return '';
             
            return name;
        };
        
        const name = getName();
        const cancel = false;
        
        Dialog.prompt(TITLE, msg, name, {cancel}).then((name) => {
            if (!name)
                return;
            
            const path = (type) => {
                const result = dir + name;
                
                if (!type)
                    return result;
                
                return result + type;
            };
            
            RESTful.write(path(type), (error) => {
                if (error)
                    return;
                
                const currentName = name;
                
                CloudCmd.refresh({
                    currentName
                });
            });
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
    this.getCurrentDirPath = (panel = DOM.getPanel()) => {
        const path = DOM.getByDataName('js-path', panel);
        const ret = path && path.textContent;
        
        return ret;
    };
    
    /**
     * get current direcotory path
     */
    this.getParentDirPath = (panel) => {
        const path = DOM.getCurrentDirPath(panel);
        const dirName = DOM.getCurrentDirName() + '/';
        
        if (path !== '/')
            return path.replace(RegExp(dirName + '$'), '');
        
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
     * unified way to get current file
     *
     * @currentFile
     */
    this.getCurrentFile = () => {
        return DOM.getByClass(CURRENT_FILE);
    };
    
    /**
     * get current file by name
     */
    this.getCurrentByName = (name, panel = CurrentInfo.panel) => {
        const dataName = 'js-file-' + name;
        const element = DOM.getByDataName(dataName, panel);
        
        return element;
    };
    
    /**
     * unified way to get current file
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
        const current = currentFile || Cmd.getCurrentFile();
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
        const current = currentFile || Cmd.getCurrentFile();
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
    this.loadCurrentSize = (callback, currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const query = '?size';
        const link = DOM.getCurrentPath(current);
        
        Images.show.load();
        
        if (name === '..')
            return;
        
        RESTful.read(link + query, (error, size) => {
            if (error)
                return;
                
            DOM.setCurrentSize(size, current);
            exec(callback, current);
            Images.hide();
        });
    };
    
    /**
     * load hash
     * @callback
     * @currentFile
     */
    this.loadCurrentHash = (callback, currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const query = '?hash';
        const link = DOM.getCurrentPath(current);
        
        RESTful.read(link + query, callback);
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
        
        RESTful.read(link + query, callback);
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
        const Dialog = DOM.Dialog;
        const Info = DOM.CurrentInfo;
        const current = currentFile || DOM.getCurrentFile();
        const path = DOM.getCurrentPath(current);
        const isDir = DOM.isCurrentIsDir(current);
        
        const func = (error, data) => {
            const ONE_MEGABYTE = 1024 * 1024 * 1024;
            
            if (!error) {
                if (itype.object(data))
                    data = jonny.stringify(data);
                
                const length  = data.length;
                
                if (hash && length < ONE_MEGABYTE)
                    DOM.saveDataToStorage(path, data, hash);
            }
            
            callback(error, data);
        };
        
        if (Info.name === '..') {
            Dialog.alert.noFiles(TITLE);
            return callback(Error('No files selected!'));
        }
        
        if (isDir)
            return RESTful.read(path, func);
        
        DOM.checkStorageHash(path, (error, equal, hashNew) => {
            if (error)
                return callback(error);
            
            if (equal)
                return DOM.getDataFromStorage(path, callback);
            
            hash = hashNew;
            RESTful.read(path, func);
        });
    };
    
    /**
     * unified way to save current file content
     *
     * @callback - function({data, name}) {}
     * @currentFile
     */
    this.saveCurrentData = (url, data, callback, query = '') => {
        DOM.RESTful.write(url + query, data, (error) => {
            !error && DOM.saveDataToStorage(url, data);
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
     * private function thet unset currentfile
     *
     * @currentFile
     */
    function unsetCurrentFile(currentFile) {
        const is = DOM.isCurrentFile(currentFile);
        
        if (!is)
            return;
        
        currentFile.classList.remove(CURRENT_FILE);
    }
    
    /**
     * unified way to set current file
     */
    this.setCurrentFile = (currentFile, options) => {
        const o = options;
        const CENTER = true;
        const currentFileWas = DOM.getCurrentFile();
        
        if (!currentFile)
            return DOM;
        
        let pathWas = '';
        
        if (currentFileWas) {
            pathWas = DOM.getCurrentDirPath();
            unsetCurrentFile(currentFileWas);
        }
        
        currentFile.classList.add(CURRENT_FILE);
        
        let path = DOM.getCurrentDirPath();
        
        const name = CloudCmd.config('name');
        if (path !== pathWas) {
            DOM.setTitle(getTitle({
                name,
                path,
            }));
            
            /* history could be present
             * but it should be false
             * to prevent default behavior
             */
            if (!o || o.history !== false) {
                const historyPath = path === '/' ? path : FS + path;
                DOM.setHistory(historyPath, null, historyPath);
            }
        }
        
        /* scrolling to current file */
        DOM.scrollIntoViewIfNeeded(currentFile, CENTER);
        
        CloudCmd.emit('current-file', currentFile);
        CloudCmd.emit('current-path', path);
        CloudCmd.emit('current-name', DOM.getCurrentName(currentFile));
        
        return DOM;
    };
    
    /*
      * set current file by position
      *
      * @param layer    - element
      * @param          - position {x, y}
      */
    this.getCurrentByPosition = ({x, y}) => {
        const element = document.elementFromPoint(x, y);
        
        const getEl = (el) => {
            const {tagName} = el;
            const isChild = /A|SPAN|LI/.test(tagName);
            
            if (!isChild)
                return null;
            
            if (tagName === 'A')
                return el.parentElement.parentElement;
            
            if (tagName === 'SPAN')
                return el.parentElement;
            
            return el;
        };
        
        const el = getEl(element);
        
        if (el && el.tagName !== 'LI')
            return null;
        
        return el;
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
        const files = CurrentInfo.files;
        
        selectByPattern(msg, files);
    };
    
    /**
     * open dialog with shrink selection
     */
    this.shrinkSelection = () => {
        const msg = 'shrink';
        const files = CurrentInfo.files;
       
        selectByPattern(msg, files);
    };
    
    /**
     * setting history wrapper
     */
    this.setHistory = (data, title, url) => {
        const ret = window.history;
        
        url = CloudCmd.PREFIX + url;
        
        if (ret)
            history.pushState(data, title, url);
        
        return ret;
    };
    
    /**
     * set title or create title element
     *
     * @param name
     */
    
    this.setTitle = (name) => {
        if (!Title)
            Title = DOM.getByTag('title')[0] ||
                    DOM.load({
                        name            : 'title',
                        innerHTML       : name,
                        parentElement   : document.head
                    });
        
        Title.textContent = name;
        
        return DOM;
    };
    
    /**
     * current file check
     *
     * @param currentFile
     */
    this.isCurrentFile = (currentFile) => {
        if (!currentFile)
            return false;
        
        return DOM.isContainClass(currentFile, CURRENT_FILE);
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
        const current = currentFile || this.getCurrentFile();
        const fileType = DOM.getByDataName('js-type', current);
        const ret = DOM.isContainClass(fileType, 'directory');
        
        return ret;
    };
    
    /**
     * get link from current (or param) file
     *
     * @param currentFile - current file by default
     */
    this.getCurrentLink = (currentFile) => {
        const current = currentFile || this.getCurrentFile();
        const link = DOM.getByTag('a', current);
        
        return link[0];
    };
    
    /**
     * get link from current (or param) file
     *
     * @param currentFile - current file by default
     */
    this.getCurrentPath = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        const element = DOM.getByTag('a', current)[0];
        const prefix = CloudCmd.PREFIX;
        const path = element.getAttribute('href')
            .replace(RegExp('^' + prefix + FS), '');
        
        return path;
    };
    
    /**
     * get name from current (or param) file
     *
     * @param currentFile
     */
    this.getCurrentName = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        
        if (!current)
            return '';
           
        const link = DOM.getCurrentLink(current);
        
        if (!link)
            return '';
            
        const name = link.title;
        
        return name;
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
     * set name from current (or param) file
     *
     * @param name
     * @param current
     */
    this.setCurrentName = (name, current) => {
        const Info = CurrentInfo;
        const link = Info.link;
        const PREFIX = CloudCmd.PREFIX;
        const dir = PREFIX + FS + Info.dirPath;
        
        link.title      = name;
        link.innerHTML  = encode(name);
        link.href       = dir + name;
        
        current.setAttribute('data-name', 'js-file-' + name);
        
        return link;
    };
    
    /**
     * check storage hash
     */
    this.checkStorageHash = (name, callback) => {
        const parallel = exec.parallel;
        const loadHash = DOM.loadCurrentHash;
        const nameHash = name + '-hash';
        const getStoreHash = exec.with(Storage.get, nameHash);
        
        if (typeof name !== 'string')
            throw Error('name should be a string!');
        
        if (typeof callback !== 'function')
            throw Error('callback should be a function!');
        
        parallel([loadHash, getStoreHash], (error, loadHash, storeHash) => {
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
        const allowed = CloudCmd.config('localStorage');
        const isDir = DOM.isCurrentIsDir();
        const nameHash = name + '-hash';
        const nameData = name + '-data';
        
        if (!allowed || isDir)
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
        const allowed = CloudCmd.config('localStorage');
        const isDir = DOM.isCurrentIsDir();
        
        if (!allowed || isDir)
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
        let files, panel, isLeft;
        let dataName = 'js-';
        
        const current = DOM.getCurrentFile();
        
        if (!current) {
            panel = DOM.getByDataName('js-left');
        } else {
            files = current.parentElement,
            panel = files.parentElement,
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
        const panel = DOM.getPanel({active: active});
        
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
            active
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
            Cmd.getCurrentFile();
        
        const parent = current && current.parentElement;
        const name = Cmd.getCurrentName(current);
        
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
    this.renameCurrent = (current) => {
        const Dialog = DOM.Dialog;
        
        if (!Cmd.isCurrentFile(current))
            current = Cmd.getCurrentFile();
        
        const from = Cmd.getCurrentName(current);
        
        if (from === '..')
            return Dialog.alert.noFiles(TITLE);
        
        const cancel = false;
        
        Dialog.prompt(TITLE, 'Rename', from, {cancel}).then((to) => {
            const isExist = !!DOM.getCurrentByName(to);
            const dirPath = Cmd.getCurrentDirPath();
            
            if (from === to)
                return;
            
            const files = {
                from : dirPath + from,
                to : dirPath + to
            };
            
            RESTful.mv(files, (error) => {
                if (error)
                    return;
                
                DOM.setCurrentName(to, current);
                Storage.remove(dirPath);
                
                if (isExist)
                    CloudCmd.refresh();
            });
        });
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
            active: false
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
                current = filesPassive[0];
        }
        
        DOM.setCurrentFile(current, {
            history: true
        });
        
        CloudCmd.emit('active-dir', Info.dirPath);
        
        return DOM;
    };
    
    this.getPackerExt = (type) => {
        if (type === 'zip')
            return '.zip';
        
        return '.tar.gz';
    };
    
    this.goToDirectory = () => {
        const msg = 'Go to directory:';
        const path = CurrentInfo.dirPath;
        const Dialog = DOM.Dialog;
        const cancel = false;
        const setPath = (path) => ({
            path
        });
        
        Dialog.prompt(TITLE, msg, path, {cancel})
            .then(setPath)
            .then(CloudCmd.loadDir);
    },
    
    this.duplicatePanel = () => {
        const Info = CurrentInfo;
        const isDir = Info.isDir;
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
        const {panel} = Info;
        const {files} = Info;
        const {element} = Info;
        
        const panelPassive = Info.panelPassive;
        
        const dirPath = DOM.getCurrentDirPath();
        const dirPathPassive = DOM.getNotCurrentDirPath();
        
        let currentIndex = files.indexOf(element);
        
        CloudCmd.loadDir({
            path: dirPath,
            panel: panelPassive,
            noCurrent: true
        });
        
        CloudCmd.loadDir({
            path: dirPathPassive,
            panel: panel
        }, () => {
            const files = Info.files;
            const length = files.length - 1;
            
            if (currentIndex > length)
                currentIndex = length;
            
            const el = files[currentIndex];
            
            DOM.setCurrentFile(el);
        });
    };
    
    this.CurrentInfo = CurrentInfo,
    
    this.updateCurrentInfo = (currentFile) => {
        const info = Cmd.CurrentInfo;
        const current = currentFile || Cmd.getCurrentFile();
        const files = current.parentElement;
        const panel = files.parentElement;
        
        const panelPassive = Cmd.getPanel({
            active: false
        });
        
        const filesPassive = DOM.getFiles(panelPassive);
        const name = Cmd.getCurrentName(current);
        
        info.dir            = Cmd.getCurrentDirName();
        info.dirPath        = Cmd.getCurrentDirPath();
        info.parentDirPath  = Cmd.getParentDirPath();
        info.element        = current;
        info.ext            = Util.getExt(name);
        info.files          = [...files.children];
        info.filesPassive   = [...filesPassive];
        info.first          = files.firstChild;
        info.getData        = Cmd.getCurrentData;
        info.last           = files.lastChild;
        info.link           = Cmd.getCurrentLink(current);
        info.mode           = Cmd.getCurrentMode(current);
        info.name           = name;
        info.path           = Cmd.getCurrentPath(current);
        info.panel          = panel;
        info.panelPassive   = panelPassive;
        info.size           = Cmd.getCurrentSize(current);
        info.isDir          = Cmd.isCurrentIsDir();
        info.isSelected     = Cmd.isSelected(current);
        info.panelPosition  = Cmd.getPanel().dataset.name.replace('js-', '');
        info.isOnePanel     =
            info.panel.getAttribute('data-name') ===
            info.panelPassive.getAttribute('data-name');
    };
}

