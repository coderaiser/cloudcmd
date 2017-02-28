/* global CloudCmd */

'use strict';

const itype = require('itype/legacy');
const exec = require('execon');
const jonny = require('jonny');
const Util = require('../../common/util');

const {
    getTitle,
    FS,
    Entity,
} = require('../../common/cloudfunc');

const DOMTree = require('./dom-tree');

const DOM = Object.assign({}, DOMTree, new CmdProto());

module.exports = DOM;

const Images = require('./images');
const load = require('./load');
const Files = require('./files');
const RESTful = require('./rest');

DOM.Images = Images;
DOM.load = load;
DOM.Files = Files;
DOM.RESTful = RESTful;

DOM.uploadDirectory = require('./directory');
DOM.Buffer = require('./buffer');
DOM.Events = require('./events');
DOM.Storage = require('./storage');
DOM.RESTful = require('./rest');

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
    this.loadJquery         = function(callback) {
        DOM.loadRemote('jquery', {
            name    : '$'
        }, callback);
        
        return DOM;
    };
    
    this.loadSocket         = function(callback) {
        DOM.loadRemote('socket', {
            name    : 'io'
        }, callback);
        
        return DOM;
    };
    
    /** function loads css and js of Menu
     * @param callback
     */
    this.loadMenu           = function(callback) {
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
            const name = Cmd.getCurrentName()
            
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
                const result = dir + name
                
                if (!type)
                    return result;
                
                return result + type;
            };
            
            RESTful.write(path(type), (error) => {
                !error && CloudCmd.refresh(null, () => {
                    DOM.setCurrentByName(name);
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
        const path =  DOM.getByDataName('js-path', panel);
        const ret = path && path.textContent;
        
        return ret;
    };
    
    /**
     * get current direcotory path
     */
    this.getParentDirPath       = function(panel) {
        var path    = DOM.getCurrentDirPath(panel),
            dirName = DOM.getCurrentDirName() + '/';
        
        if (path !== '/')
            path = path.replace(RegExp(dirName + '$'), '');
        
        return path;
    };
    
    /**
     * get not current direcotory path
     */
    this.getNotCurrentDirPath       = function() {
        var panel  = DOM.getPanel({active: false}),
            path   = DOM.getCurrentDirPath(panel);
        
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
    this.getCurrentByName           = function(name, panelParam) {
        var element,
            panel   = panelParam || CurrentInfo.panel;
        
        name    = 'js-file-' + name;
        element = DOM.getByDataName(name, panel);
        
        return element;
    };
    
    /**
     * unified way to get current file
     *
     * @currentFile
     */
    this.getSelectedFiles         = function() {
        var panel       = DOM.getPanel(),
            selected    = DOM.getByClassAll(SELECTED_FILE, panel),
            ret         = [].slice.call(selected);
        
        return ret;
    };
    
    
    /*
     * unselect all files
     */
    this.unselectFiles          = function(files) {
        var array,
            isArray = Array.isArray(files);
        
        if (!files) {
            array = DOM.getSelectedFiles();
        } else if (!isArray)
            array = [].slice.call(files);
        
        array.forEach(DOM.toggleSelectedFile);
    };
    
    /**
     * get all selected files or current when none selected
     *
     * @currentFile
     */
    this.getActiveFiles         = function() {
        var current = DOM.getCurrentFile();
        var files = DOM.getSelectedFiles();
        var name = DOM.getCurrentName(current);
        
        if (!files.length && name !== '..')
            return [current];
        
        return files;
    };
    
    /**
     * get size
     * @currentFile
     */
    this.getCurrentSize          = function(currentFile) {
        var current     = currentFile || Cmd.getCurrentFile(),
            size        = DOM.getByDataName('js-size', current);
        
        /* если это папка - возвращаем слово dir вместо размера*/
        size    = size
            .textContent
            .replace(/^<|>$/g, '');
        
        return size;
    };
    
    /**
     * get size
     * @currentFile
     */
    this.loadCurrentSize          = function(callback, currentFile) {
        var RESTful     = DOM.RESTful,
            current     = currentFile || DOM.getCurrentFile(),
            query       = '?size',
            link        = DOM.getCurrentPath(current);
        
        Images.show.load();
        
        if (name !== '..')
            RESTful.read(link + query, function(error, size) {
                if (!error) {
                    DOM.setCurrentSize(size, current);
                    exec(callback, current);
                    Images.hide();
                }
            });
    };
    
    /**
     * load hash
     * @callback
     * @currentFile
     */
    this.loadCurrentHash          = function(callback, currentFile) {
        var RESTful     = DOM.RESTful,
            current     = currentFile || DOM.getCurrentFile(),
            query       = '?hash',
            link        = DOM.getCurrentPath(current);
        
        RESTful.read(link + query, callback);
    };
    
    /**
     * load current modification time of file
     * @callback
     * @currentFile
     */
    this.loadCurrentTime          = function(callback, currentFile) {
        var RESTful     = DOM.RESTful,
            current     = currentFile || DOM.getCurrentFile(),
            query       = '?time',
            link        = DOM.getCurrentPath(current);
        
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
        var ret,
            current     = currentFile || DOM.getCurrentFile(),
            owner       = DOM.getByDataName('js-owner', current);
        
        ret             = owner.textContent;
        
        return ret;
    };
    
    /**
     * unified way to get current file content
     *
     * @param callback
     * @param currentFile
     */
    this.getCurrentData             = function(callback, currentFile) {
        var hash,
            RESTful         = DOM.RESTful,
            Dialog          = DOM.Dialog,
            Info            = DOM.CurrentInfo,
            current         = currentFile || DOM.getCurrentFile(),
            path            = DOM.getCurrentPath(current),
            isDir           = DOM.isCurrentIsDir(current),
            
            func            = function(error, data) {
                var length,
                    ONE_MEGABYTE    = 1024 * 1024 * 1024;
                
                if (!error) {
                    if (itype.object(data))
                        data = jonny.stringify(data);
                    
                    length  = data.length;
                    
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
        
        DOM.checkStorageHash(path, function(error, equal, hashNew) {
            if (error) {
                callback(error);
            } else if (equal) {
                DOM.getDataFromStorage(path, callback);
            } else {
                hash = hashNew;
                RESTful.read(path, func);
            }
        });
    };
    
    /**
     * unified way to save current file content
     *
     * @callback - function({data, name}) {}
     * @currentFile
     */
    this.saveCurrentData             = function(url, data, callback, query) {
        if (!query)
            query = '';
        
        DOM.RESTful.write(url + query, data, function(error) {
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
        
        if (path !== pathWas) {
            DOM.setTitle(getTitle(path));
            
            /* history could be present
             * but it should be false
             * to prevent default behavior
             */
            if (!o || o.history !== false) {
                if (path !== '/')
                    path = FS + path;
                
                DOM.setHistory(path, null, path);
            }
        }
        
        /* scrolling to current file */
        DOM.scrollIntoViewIfNeeded(currentFile, CENTER);
        
        Cmd.updateCurrentInfo();
        
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
    
    this.toggleSelectedFile = (currentFile) => {
        const current = currentFile || DOM.getCurrentFile();
        
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
        
        return [].slice.call(files, i);
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
    this.isCurrentFile           = function(currentFile) {
        var ret;
        
        if (currentFile)
            ret = DOM.isContainClass(currentFile, CURRENT_FILE);
        
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
    this.isCurrentIsDir            = function(currentFile) {
        var current = currentFile || this.getCurrentFile();
        var fileType = DOM.getByDataName('js-type', current);
        var ret = DOM.isContainClass(fileType, 'directory');
        
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
    this.getCurrentName          = function(currentFile) {
        var link;
        var name = '';
        var current = currentFile || DOM.getCurrentFile();
        
        if (current)
            link        = DOM.getCurrentLink(current);
        
        if (link) {
            name = link.title;
        }
        
        return name;
    };
    
    this.getFilenames = function(allFiles) {
        var first, name;
        var files;
        var slice = Array.prototype.slice;
        var names = [];
        
        if (!allFiles)
            throw Error('AllFiles could not be empty');
        
        files           = slice.call(allFiles);
        first           = files[0];
        
        if (first) {
            name        = DOM.getCurrentName(first);
        } else {
            first       = DOM.getCurrentFile();
            name        = DOM.getCurrentName(first);
        }
        
        if (name === '..')
            files.shift();
        
        names = files.map(function(current) {
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
        link.innerHTML  = Entity.encode(name);
        link.href       = dir + name;
        
        current.setAttribute('data-name', 'js-file-' + name);
        
        return link;
    };
    
    /**
     * check storage hash
     */
    this.checkStorageHash = function(name, callback) {
        var Storage = DOM.Storage;
        var parallel = exec.parallel;
        var loadHash = DOM.loadCurrentHash;
        var nameHash = name + '-hash';
        var getStoreHash = exec.with(Storage.get, nameHash);
        
        if (typeof name !== 'string')
            throw Error('name should be a string!');
        
        if (typeof callback !== 'function')
            throw Error('callback should be a function!');
        
        parallel([loadHash, getStoreHash], function(error, loadHash, storeHash) {
            var equal;
            var isContain = /error/.test(loadHash);
            
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
        var allowed     = CloudCmd.config('localStorage');
        var isDir       = DOM.isCurrentIsDir();
        var nameHash    = name + '-hash';
        var nameData    = name + '-data';
        
        if (!allowed || isDir)
            return exec(callback);
        
        exec.if(hash, function() {
            var Storage = DOM.Storage;
            
            Storage.set(nameHash, hash);
            Storage.set(nameData, data);
            
            exec(callback, hash);
        }, function(callback) {
            DOM.loadCurrentHash(function(error, loadHash) {
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
    this.getDataFromStorage = function(name, callback) {
        var Storage     = DOM.Storage;
        var nameHash    = name + '-hash';
        var nameData    = name + '-data';
        var allowed     = CloudCmd.config('localStorage');
        var isDir       = DOM.isCurrentIsDir();
        
        if (!allowed || isDir)
            return exec(callback);
        
        exec.parallel([
            exec.with(Storage.get, nameData),
            exec.with(Storage.get, nameHash),
        ], callback);
    };
    
    this.getFM = function() {
        return DOM.getPanel().parentElement;
    };
    
    this.getPanelPosition = function(panel) {
        panel = panel || DOM.getPanel();
        
        return panel.dataset.name.replace('js-', '');
    };
    
    /** function getting panel active, or passive
     * @param options = {active: true}
     */
    this.getPanel = function(options) {
        var files, panel, isLeft,
            dataName    = 'js-',
            current     = DOM.getCurrentFile();
        
        if (!current) {
            panel       = DOM.getByDataName('js-left');
        } else {
            files       = current.parentElement,
            panel       = files.parentElement,
            isLeft      = panel.getAttribute('data-name') === 'js-left';
        }
            
        /* if {active : false} getting passive panel */
        if (options && !options.active) {
            dataName    += isLeft ? 'right' : 'left';
            panel       = DOM.getByDataName(dataName);
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
    
    this.getFiles               = function(element) {
        var files   = DOM.getByDataName('js-files', element),
            ret     = files.children || [];
        
        return ret;
    };
    
    /**
     * shows panel right or left (or active)
     */
    this.showPanel               = function(active) {
        var ret     = true,
            panel   = DOM.getPanel({active: active});
        
        if (panel)
            DOM.show(panel);
        else
            ret = false;
        
        return ret;
    };
    
    /**
     * hides panel right or left (or active)
     */
    this.hidePanel               = function(active) {
        var ret     = false,
            panel   = DOM.getPanel({active: active});
        
        if (panel)
            ret = DOM.hide(panel);
        
        return ret;
    };
        
    /**
     * open window with URL
     * @param url
     */
    this.openWindow              = function(url) {
        var left        = 140,
            top         = 187,
            width       = 1000,
            height      = 650,
            
            options     = 'left='   + left          +
                ',top='             + top           +
                ',width='           + width         +
                ',height='          + height        +
                ',personalbar=0,toolbar=0'          +
                ',scrollbars=1,resizable=1',
            
            wnd         = window.open(url, 'Cloud Commander Auth', options);
        
        if (!wnd)
            DOM.Dialog.alert(TITLE, 'Please disable your popup blocker and try again.');
        
        return wnd;
    };
    
    /**
     * remove child of element
     * @param pChild
     * @param element
     */
    this.remove                  = function(child, element) {
        var parent = element || document.body;
        
        parent.removeChild(child);
            
        return DOM;
    };
    
    /**
     * remove current file from file table
     * @param current
     *
     */
    this.deleteCurrent           = function(current) {
        var next, prev, currentNew;
        
        if (!current)
            Cmd.getCurrentFile();
        
        var parent = current && current.parentElement;
        var name = Cmd.getCurrentName(current);
        
        if (current && name !== '..') {
            next    = current.nextSibling,
            prev    = current.previousSibling;
                
            if (next)
                currentNew = next;
            else if (prev)
                currentNew = prev;
            
            DOM.setCurrentFile(currentNew);
            
            parent.removeChild(current);
        }
        
        return currentNew;
    };
    
     /**
     * remove selected files from file table
     * @Selected
     */
    this.deleteSelected          = function(selected) {
        var i, n, current;
        
        if (!selected)
            selected = DOM.getSelectedFiles();
        
        if (selected) {
            n = selected.length;
            
            for (i = 0; i < n; i++) {
                current = selected[i];
                DOM.deleteCurrent(current);
            }
        }
        
        return selected;
    };
    
    /**
     * rename current file
     *
     * @currentFile
     */
    this.renameCurrent            = function(current) {
        var from, dirPath, files, isExist,
            RESTful     = DOM.RESTful,
            Dialog      = DOM.Dialog;
        
        if (!Cmd.isCurrentFile(current))
            current = Cmd.getCurrentFile();
        
        from        = Cmd.getCurrentName(current);
        
        if (from === '..')
            Dialog.alert.noFiles(TITLE);
        else
            Dialog.prompt(TITLE, 'Rename', from, {cancel: false}).then(function(to) {
                isExist     = !!DOM.getCurrentByName(to);
                dirPath     = Cmd.getCurrentDirPath();
                
                if (from !== to) {
                    files      = {
                        from    : dirPath + from,
                        to      : dirPath + to
                    };
                    
                    RESTful.mv(files, function(error) {
                        var Storage = DOM.Storage;
                        
                        if (!error) {
                            DOM.setCurrentName(to, current);
                            Cmd.updateCurrentInfo();
                            Storage.remove(dirPath);
                            
                            if (isExist)
                                CloudCmd.refresh();
                        }
                    });
                }
            });
    };
    
    /**
     * unified way to scrollIntoViewIfNeeded
     * (native suporte by webkit only)
     * @param element
     * @param pCenter
     */
    this.scrollIntoViewIfNeeded  = function(element, center) {
        var ret = element && element.scrollIntoViewIfNeeded;
        
        /* for scroll as small as possible
         * param should be false
         */
        if (arguments.length === 1)
            center = false;
        
        if (ret)
            element.scrollIntoViewIfNeeded(center);
        
        return ret;
    };
    
    /* scroll on one page*/
    this.scrollByPages           = function(element, pPages) {
        var ret = element && element.scrollByPages && pPages;
        
        if (ret)
            element.scrollByPages(pPages);
        
        return ret;
    };
    
    this.changePanel            = function() {
        var dataName, files, current,
            
            panel           = DOM.getPanel(),
            panelPassive    = DOM.getPanel({
                active: false
            }),
            
            name            = DOM.getCurrentName(),
            
            filesPassive    = DOM.getFiles(panelPassive);
        
        dataName            = panel.getAttribute('data-name');
        TabPanel[dataName]  = name;
        
        panel           = panelPassive;
        dataName        = panel.getAttribute('data-name');
        
        name            = TabPanel[dataName];
        
        if (name) {
            current     = DOM.getCurrentByName(name, panel);
            
            if (current)
                files       = current.parentElement;
        }
        
        if (!files || !files.parentElement) {
            current     = DOM.getCurrentByName(name, panel);
            
            if (!current)
                current = filesPassive[0];
        }
        
        DOM.setCurrentFile(current, {
            history: true
        });
        
        return DOM;
    };
    
    this.getPackerExt = function(type) {
        if (type === 'zip')
            return '.zip';
        
        return '.tar.gz';
    };
    
    this.goToDirectory          = function() {
        var msg     = 'Go to directory:',
            path    = CurrentInfo.dirPath,
            Dialog  = DOM.Dialog;
        
        Dialog.prompt(TITLE, msg, path, {cancel: false}).then(function(path) {
            CloudCmd.loadDir({
                path: path
            });
        });
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
        info.files          = [].slice.call(files.children),
        info.filesPassive   = [].slice.call(filesPassive),
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

