'use strict';

/* global CloudCmd */

const Util = require('../../common/util');

const Images = require('./images');
const load = require('./load');
const Files = require('./files');
const RESTful = require('./rest');
const IO = require('./io');
const Storage = require('./storage');
const Dialog = require('./dialog');
const renameCurrent = require('./operations/rename-current');

const CurrentFile = require('./current-file');
const DOMTree = require('./dom-tree');

const Cmd = module.exports;
const DOM = {
    ...DOMTree,
    ...CurrentFile,
    ...Cmd,
};

const CurrentInfo = {};

DOM.Images = Images;
DOM.load = load;
DOM.Files = Files;
DOM.RESTful = RESTful;
DOM.IO = IO;
DOM.Storage = Storage;
DOM.Dialog = Dialog;
DOM.CurrentInfo = CurrentInfo;

module.exports = DOM;

DOM.uploadDirectory = require('./directory');
DOM.Buffer = require('./buffer');
DOM.Events = require('./events');

const loadRemote = require('./load-remote');
const selectByPattern = require('./select-by-pattern');

const SELECTED_FILE = 'selected-file';
const TabPanel = {
    'js-left'        : null,
    'js-right'       : null,
};

module.exports.loadRemote = (name, options, callback) => {
    loadRemote(name, options, callback);
    return DOM;
};

module.exports.loadSocket = (callback) => {
    DOM.loadRemote('socket', {
        name    : 'io',
    }, callback);
    
    return DOM;
};

/**
 * create new folder
 *
 */
module.exports.promptNewDir = async function() {
    await promptNew('directory');
};

/**
 * create new file
 *
 * @typeName
 * @type
 */
module.exports.promptNewFile = async () => {
    await promptNew('file');
};

async function promptNew(typeName) {
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
    
    const path = `${dir}${currentName}`;
    
    if (typeName === 'directory')
        await RESTful.createDirectory(path);
    else
        await RESTful.write(path);
    
    await CloudCmd.refresh({
        currentName,
    });
}

/**
 * get current direcotory name
 */
module.exports.getCurrentDirName = () => {
    const href = DOM.getCurrentDirPath()
        .replace(/\/$/, '');
    
    const substr  = href.substr(href, href.lastIndexOf('/'));
    const ret     = href.replace(substr + '/', '') || '/';
    
    return ret;
};

/**
 * get current direcotory path
 */
module.exports.getParentDirPath = (panel) => {
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
module.exports.getNotCurrentDirPath = () => {
    const panel = DOM.getPanel({active: false});
    const path = DOM.getCurrentDirPath(panel);
    
    return path;
};

/**
 * get current file by name
 */
module.exports.getCurrentByName = (name, panel = CurrentInfo.panel) => {
    const dataName = 'js-file-' + btoa(encodeURI(name));
    const element = DOM.getByDataName(dataName, panel);
    
    return element;
};

/**
 * unified way to get selected files
 *
 * @currentFile
 */
module.exports.getSelectedFiles = () => {
    const panel = DOM.getPanel();
    const selected = DOM.getByClassAll(SELECTED_FILE, panel);
    
    return Array.from(selected);
};

/*
 * unselect all files
 */
module.exports.unselectFiles = (files) => {
    files = files || DOM.getSelectedFiles();
    
    Array.from(files).forEach(DOM.toggleSelectedFile);
};

/**
 * get all selected files or current when none selected
 *
 * @currentFile
 */
module.exports.getActiveFiles = () => {
    const current = DOM.getCurrentFile();
    const files = DOM.getSelectedFiles();
    const name = DOM.getCurrentName(current);
    
    if (!files.length && name !== '..')
        return [current];
    
    return files;
};

module.exports.getCurrentDate = (currentFile) => {
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
module.exports.getCurrentSize = (currentFile) => {
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
module.exports.loadCurrentSize = async (currentFile) => {
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
};

/**
 * load hash
 * @callback
 * @currentFile
 */
module.exports.loadCurrentHash = async (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const query = '?hash';
    const link = DOM.getCurrentPath(current);
    
    const [, data] = await RESTful.read(link + query);
    return data;
};

/**
 * set size
 * @currentFile
 */
module.exports.setCurrentSize = (size, currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const sizeElement = DOM.getByDataName('js-size', current);
    
    sizeElement.textContent = size;
};

/**
 * @currentFile
 */
module.exports.getCurrentMode = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const mode = DOM.getByDataName('js-mode', current);
    
    return mode.textContent;
};

/**
 * @currentFile
 */
module.exports.getCurrentOwner = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const owner = DOM.getByDataName('js-owner', current);
    
    return owner.textContent;
};

/**
 * unified way to get current file content
 *
 * @param currentFile
 */
module.exports.getCurrentData = async (currentFile) => {
    const {Dialog} = DOM;
    const Info = DOM.CurrentInfo;
    const current = currentFile || DOM.getCurrentFile();
    const path = DOM.getCurrentPath(current);
    const isDir = DOM.isCurrentIsDir(current);
    
    if (Info.name === '..') {
        Dialog.alert.noFiles();
        return [Error('No Files')];
    }
    
    if (isDir)
        return await RESTful.read(path);
    
    const [hashNew, hash] = await DOM.checkStorageHash(path);
    
    if (!hashNew)
        return [Error(`Can't get hash of a file`)];
    
    if (hash === hashNew)
        return [null, await Storage.get(`${path}-data`)];
    
    const [e, data] = await RESTful.read(path);
    
    if (e)
        return [e, null];
    
    const ONE_MEGABYTE = 1024 * 1024 * 1024;
    const {length} = data;
    
    if (hash && length < ONE_MEGABYTE)
        await DOM.saveDataToStorage(path, data, hashNew);
    
    return [null, data];
};

/**
 * unified way to get RefreshButton
 */
module.exports.getRefreshButton = (panel = DOM.getPanel()) => {
    return DOM.getByDataName('js-refresh', panel);
};

/**
 * select current file
 * @param currentFile
 */
module.exports.selectFile = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    
    current.classList.add(SELECTED_FILE);
    
    return Cmd;
};

module.exports.unselectFile = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    
    current.classList.remove(SELECTED_FILE);
    
    return Cmd;
};

module.exports.toggleSelectedFile = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const name = DOM.getCurrentName(current);
    
    if (name === '..')
        return Cmd;
    
    current.classList.toggle(SELECTED_FILE);
    
    return Cmd;
};

module.exports.toggleAllSelectedFiles = () => {
    DOM.getAllFiles().map(DOM.toggleSelectedFile);
    
    return Cmd;
};

module.exports.selectAllFiles = () => {
    DOM.getAllFiles().map(DOM.selectFile);
    
    return Cmd;
};

module.exports.getAllFiles = () => {
    const panel = DOM.getPanel();
    const files = DOM.getFiles(panel);
    const name = DOM.getCurrentName(files[0]);
    
    const from = (a) => a === '..' ? 1 : 0;
    const i = from(name);
    
    return Array.from(files).slice(i);
};

/**
 * open dialog with expand selection
 */
module.exports.expandSelection = () => {
    const msg = 'expand';
    const {files} = CurrentInfo;
    
    selectByPattern(msg, files);
};

/**
 * open dialog with shrink selection
 */
module.exports.shrinkSelection = () => {
    const msg = 'shrink';
    const {files} = CurrentInfo;
    
    selectByPattern(msg, files);
};

/**
 * setting history wrapper
 */
module.exports.setHistory = (data, title, url) => {
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
module.exports.isSelected = (selected) => {
    if (!selected)
        return false;
    
    return DOM.isContainClass(selected, SELECTED_FILE);
};

/**
 * get link from current (or param) file
 *
 * @param currentFile - current file by default
 */
module.exports.getCurrentLink = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const link = DOM.getByTag('a', current);
    
    return link[0];
};

module.exports.getFilenames = (files) => {
    if (!files)
        throw Error('AllFiles could not be empty');
    
    const first = files[0] || DOM.getCurrentFile();
    const name = DOM.getCurrentName(first);
    
    const allFiles = Array.from(files);
    
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
module.exports.checkStorageHash = async (name) => {
    const nameHash = name + '-hash';
    
    if (typeof name !== 'string')
        throw Error('name should be a string!');
    
    const [loadHash, storeHash] = await Promise.all([
        DOM.loadCurrentHash(),
        Storage.get(nameHash),
    ]);
    
    return [loadHash, storeHash];
};

/**
 * save data to storage
 *
 * @param name
 * @param data
 * @param hash
 * @param callback
 */
module.exports.saveDataToStorage = async (name, data, hash) => {
    const isDir = DOM.isCurrentIsDir();
    
    if (isDir)
        return;
    
    hash = hash || await DOM.loadCurrentHash();
    
    const nameHash = name + '-hash';
    const nameData = name + '-data';
    
    await Storage.set(nameHash, hash);
    await Storage.set(nameData, data);
    
    return hash;
};

module.exports.getFM = () => {
    return DOM.getPanel().parentElement;
};

module.exports.getPanelPosition = (panel) => {
    panel = panel || DOM.getPanel();
    
    return panel.dataset.name.replace('js-', '');
};

/** function getting panel active, or passive
 * @param options = {active: true}
 */
module.exports.getPanel = (options) => {
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

module.exports.getFiles = (element) => {
    const files = DOM.getByDataName('js-files', element);
    return files.children || [];
};

/**
 * shows panel right or left (or active)
 */
module.exports.showPanel = (active) => {
    const panel = DOM.getPanel({active});
    
    if (!panel)
        return false;
    
    DOM.show(panel);
    
    return true;
};

/**
 * hides panel right or left (or active)
 */
module.exports.hidePanel = (active) => {
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
module.exports.remove = (child, element) => {
    const parent = element || document.body;
    
    parent.removeChild(child);
    
    return DOM;
};

/**
 * remove current file from file table
 * @param current
 *
 */
module.exports.deleteCurrent = (current) => {
    if (!current)
        DOM.getCurrentFile();
    
    const parent = current?.parentElement;
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
module.exports.deleteSelected = (selected) => {
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
module.exports.renameCurrent = renameCurrent;

/**
 * unified way to scrollIntoViewIfNeeded
 * (native suporte by webkit only)
 * @param element
 * @param center - to scroll as small as possible param should be false
 */
module.exports.scrollIntoViewIfNeeded = (element, center = false) => {
    if (!element || !element.scrollIntoViewIfNeeded)
        return;
    
    element.scrollIntoViewIfNeeded(center);
};

/* scroll on one page */
module.exports.scrollByPages = (element, pPages) => {
    const ret = element?.scrollByPages && pPages;
    
    if (ret)
        element.scrollByPages(pPages);
    
    return ret;
};

module.exports.changePanel = () => {
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

module.exports.getPackerExt = (type) => {
    if (type === 'zip')
        return '.zip';
    
    return '.tar.gz';
};

module.exports.goToDirectory = async () => {
    const msg = 'Go to directory:';
    const {Dialog} = DOM;
    const {dirPath} = CurrentInfo;
    
    const [
        cancel,
        path = dirPath,
    ] = await Dialog.prompt(msg, dirPath);
    
    if (cancel)
        return;
    
    await CloudCmd.loadDir({
        path,
    });
};

module.exports.duplicatePanel = async () => {
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
    
    await CloudCmd.loadDir({
        path,
        panel,
        noCurrent,
    });
};

module.exports.swapPanels = async () => {
    const Info = CurrentInfo;
    const {
        panel,
        files,
        element,
        panelPassive,
    } = Info;
    
    const path = DOM.getCurrentDirPath();
    const dirPathPassive = DOM.getNotCurrentDirPath();
    
    let currentIndex = files.indexOf(element);
    
    await CloudCmd.loadDir({
        path,
        panel: panelPassive,
        noCurrent: true,
    });
    
    await CloudCmd.loadDir({
        path: dirPathPassive,
        panel,
    });
    
    const length = Info.files.length - 1;
    
    if (currentIndex > length)
        currentIndex = length;
    
    const el = Info.files[currentIndex];
    
    DOM.setCurrentFile(el);
};

module.exports.CurrentInfo = CurrentInfo;

module.exports.updateCurrentInfo = (currentFile) => {
    const info = DOM.CurrentInfo;
    const current = currentFile || DOM.getCurrentFile();
    const files = current.parentElement;
    const panel = files.parentElement || DOM.getPanel();
    
    const panelPassive = DOM.getPanel({
        active: false,
    });
    
    const filesPassive = DOM.getFiles(panelPassive);
    const name = DOM.getCurrentName(current);
    
    info.dir            = DOM.getCurrentDirName();
    info.dirPath        = DOM.getCurrentDirPath();
    info.parentDirPath  = DOM.getParentDirPath();
    info.element        = current;
    info.ext            = Util.getExt(name);
    info.files          = Array.from(files.children);
    info.filesPassive   = Array.from(filesPassive);
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
