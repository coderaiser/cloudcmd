/* global CloudCmd */
import * as load from '#dom/load';
import * as Files from '#dom/files';
import * as Dialog from '#dom/dialog';
import * as Events from '#dom/events';
import {getExt} from '#common/util';
import * as Storage from '#dom/storage';
import * as Images from './images.mjs';
import * as RESTful from '#dom/rest';
import renameCurrent from './operations/rename-current.js';
import * as CurrentFile from './current-file.mjs';
import * as DOMTree from './dom-tree.mjs';
import * as Cmd from './cmd.mjs';
import IO from './io/index.js';
import {uploadDirectory} from './directory.mjs';
import * as Buffer from './buffer.mjs';
import _loadRemote from './load-remote.js';
import {selectByPattern} from './select-by-pattern.mjs';

const {assign} = Object;

const DOM = {
    getCurrentDirName,
    getNotCurrentDirPath,
    getParentDirPath,
    loadRemote,
    loadSocket,
    promptNewDir,
    promptNewFile,
    unselectFiles,
    getActiveFiles,
    getCurrentDate,
    getCurrentSize,
    loadCurrentSize,
    loadCurrentHash,
    setCurrentSize,
    getCurrentMode,
    getCurrentOwner,
    getCurrentData,
    getRefreshButton,
    getAllFiles,
    expandSelection,
    shrinkSelection,
    setHistory,
    getCurrentLink,
    getFilenames,
    checkStorageHash,
    saveDataToStorage,
    getFM,
    getPanelPosition,
    getCSSVar,
    getPanel,
    getFiles,
    showPanel,
    hidePanel,
    remove,
    deleteCurrent,
    deleteSelected,
    renameCurrent,
    scrollIntoViewIfNeeded,
    scrollByPages,
    changePanel,
    getPackerExt,
    goToDirectory,
    duplicatePanel,
    swapPanels,
    updateCurrentInfo,
};

assign(DOM, {
    ...DOMTree,
    ...CurrentFile,
    ...Cmd,
});

export const CurrentInfo = {};

DOM.Images = Images;
DOM.load = load;
DOM.Files = Files;
DOM.RESTful = RESTful;
DOM.IO = IO;
DOM.Storage = Storage;
DOM.Dialog = Dialog;
DOM.CurrentInfo = CurrentInfo;

export default DOM;

DOM.uploadDirectory = uploadDirectory;
DOM.Buffer = Buffer;
DOM.Events = Events;
const isString = (a) => typeof a === 'string';

const TabPanel = {
    'js-left': null,
    'js-right': null,
};

export function loadRemote(name, options, callback) {
    _loadRemote(name, options, callback);
    return DOM;
}

export function loadSocket(callback) {
    DOM.loadRemote('socket', {
        name: 'io',
    }, callback);
    
    return DOM;
}

/**
 * create new folder
 *
 */
export async function promptNewDir() {
    await promptNew('directory');
}

/**
 * create new file
 *
 * @typeName
 * @type
 */
export async function promptNewFile() {
    await promptNew('file');
}

async function promptNew(typeName) {
    const {Dialog} = DOM;
    const dir = DOM.getCurrentDirPath();
    const msg = `New ${typeName}` || 'File';
    
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
 * get current directory name
 */
export function getCurrentDirName() {
    const href = DOM
        .getCurrentDirPath()
        .replace(/\/$/, '');
    
    const substr = href.substr(href, href.lastIndexOf('/'));
    
    return href.replace(`${substr}/`, '') || '/';
}

/**
 * get current directory path
 */
export function getParentDirPath(panel) {
    const path = DOM.getCurrentDirPath(panel);
    const dirName = DOM.getCurrentDirName() + '/';
    const index = path.lastIndexOf(dirName);
    
    if (path !== '/')
        return path.slice(0, index);
    
    return path;
}

/**
 * get not current directory path
 */
export function getNotCurrentDirPath() {
    const panel = DOM.getPanel({
        active: false,
    });
    
    return DOM.getCurrentDirPath(panel);
}

/*
 * unselect all files
 */
export function unselectFiles(files) {
    files = files || DOM.getSelectedFiles();
    
    Array
        .from(files)
        .forEach(DOM.toggleSelectedFile);
}

/**
 * get all selected files or current when none selected
 *
 * @currentFile
 */
export function getActiveFiles() {
    const current = DOM.getCurrentFile();
    const files = DOM.getSelectedFiles();
    const name = DOM.getCurrentName(current);
    
    if (!files.length && name !== '..')
        return [current];
    
    return files;
}

export function getCurrentDate(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    
    return DOM.getByDataName('js-date', current).textContent;
}

/**
 * get size
 * @currentFile
 */
export function getCurrentSize(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    
    /* если это папка - возвращаем слово dir вместо размера*/
    const size = DOM
        .getByDataName('js-size', current)
        .textContent
        .replace(/^<|>$/g, '');
    
    return size;
}

/**
 * get size
 * @currentFile
 */
export async function loadCurrentSize(currentFile) {
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
}

/**
 * load hash
 * @callback
 * @currentFile
 */
export async function loadCurrentHash(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const query = '?hash';
    const link = DOM.getCurrentPath(current);
    
    const [, data] = await RESTful.read(link + query);
    
    return data;
}

/**
 * set size
 * @currentFile
 */
export function setCurrentSize(size, currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const sizeElement = DOM.getByDataName('js-size', current);
    
    sizeElement.textContent = size;
}

/**
 * @currentFile
 */
export function getCurrentMode(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const mode = DOM.getByDataName('js-mode', current);
    
    return mode.textContent;
}

/**
 * @currentFile
 */
export function getCurrentOwner(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const owner = DOM.getByDataName('js-owner', current);
    
    return owner.textContent;
}

/**
 * unified way to get current file content
 *
 * @param currentFile
 */
export async function getCurrentData(currentFile) {
    const {Dialog} = DOM;
    const Info = DOM.CurrentInfo;
    const current = currentFile || DOM.getCurrentFile();
    const path = DOM.getCurrentPath(current);
    const isDir = DOM.isCurrentIsDir(current);
    
    if (Info.name === '..') {
        Dialog.alert.noFiles();
        return [
            Error('No Files'),
        ];
    }
    
    if (isDir)
        return await RESTful.read(path);
    
    const [hashNew, hash] = await DOM.checkStorageHash(path);
    
    if (!hashNew)
        return [
            Error(`Can't get hash of a file`),
        ];
    
    if (hash === hashNew)
        return [null, await Storage.get(`${path}-data`)];
    
    const [e, data] = await RESTful.read(path);
    
    if (e)
        return [
            e,
            null,
        ];
    
    const ONE_MEGABYTE = 1024 ** 2 * 1024;
    const {length} = data;
    
    if (hash && length < ONE_MEGABYTE)
        await DOM.saveDataToStorage(path, data, hashNew);
    
    return [null, data];
}

/**
 * unified way to get RefreshButton
 */
export function getRefreshButton(panel = DOM.getPanel()) {
    return DOM.getByDataName('js-refresh', panel);
}

export function getAllFiles() {
    const panel = DOM.getPanel();
    const files = DOM.getFiles(panel);
    const name = DOM.getCurrentName(files[0]);
    
    const from = (a) => a === '..' ? 1 : 0;
    const i = from(name);
    
    return Array
        .from(files)
        .slice(i);
}

/**
 * open dialog with expand selection
 */
export async function expandSelection() {
    const msg = 'expand';
    const {files} = CurrentInfo;
    
    await selectByPattern(msg, files);
}

/**
 * open dialog with shrink selection
 */
export async function shrinkSelection() {
    const msg = 'shrink';
    const {files} = CurrentInfo;
    
    await selectByPattern(msg, files);
}

/**
 * setting history wrapper
 */
export function setHistory(data, title, url) {
    const ret = globalThis.history;
    const {prefix} = CloudCmd;
    
    url = prefix + url;
    
    if (ret)
        history.pushState(data, title, url);
    
    return ret;
}

/**
 * get link from current (or param) file
 *
 * @param currentFile - current file by default
 */
export function getCurrentLink(currentFile) {
    const current = currentFile || DOM.getCurrentFile();
    const link = DOM.getByTag('a', current);
    
    return link[0];
}

export function getFilenames(files) {
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
}

/**
 * check storage hash
 */
export async function checkStorageHash(name) {
    const nameHash = `${name}-hash`;
    
    if (!isString(name))
        throw Error('name should be a string!');
    
    const [loadHash, storeHash] = await Promise.all([
        DOM.loadCurrentHash(),
        Storage.get(nameHash),
    ]);
    
    return [loadHash, storeHash];
}

/**
 * save data to storage
 *
 * @param name
 * @param data
 * @param hash
 */
export async function saveDataToStorage(name, data, hash) {
    const isDir = DOM.isCurrentIsDir();
    
    if (isDir)
        return;
    
    hash = hash || await DOM.loadCurrentHash();
    
    const nameHash = `${name}-hash`;
    const nameData = `${name}-data`;
    
    await Storage.set(nameHash, hash);
    await Storage.set(nameData, data);
    
    return hash;
}

export function getFM() {
    const {parentElement} = DOM.getPanel();
    return parentElement;
}

export function getPanelPosition(panel) {
    panel = panel || DOM.getPanel();
    
    return panel.dataset.name.replace('js-', '');
}

export function getCSSVar(name, {body = document.body} = {}) {
    const bodyStyle = getComputedStyle(body);
    return bodyStyle.getPropertyValue(`--${name}`);
}

/** function getting panel active, or passive
 * @param options = {active: true}
 */
export function getPanel(options) {
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
    if (globalThis.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH)
        panel = DOM.getByDataName('js-left');
    
    if (!panel)
        throw Error('can not find Active Panel!');
    
    return panel;
}

export function getFiles(element) {
    const files = DOM.getByDataName('js-files', element);
    return files.children || [];
}

/**
 * shows panel right or left (or active)
 */
export function showPanel(active) {
    const panel = DOM.getPanel({
        active,
    });
    
    if (!panel)
        return false;
    
    DOM.show(panel);
    
    return true;
}

/**
 * hides panel right or left (or active)
 */
export function hidePanel(active) {
    const panel = DOM.getPanel({
        active,
    });
    
    if (!panel)
        return false;
    
    return DOM.hide(panel);
}

/**
 * remove child of element
 * @param child
 * @param element
 */
export function remove(child, element) {
    const parent = element || document.body;
    
    parent.removeChild(child);
    
    return DOM;
}

/**
 * remove current file from file table
 * @param current
 *
 */
export function deleteCurrent(current) {
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
}

/**
 * remove selected files from file table
 * @Selected
 */
export function deleteSelected(selected) {
    selected = selected || DOM.getSelectedFiles();
    
    if (!selected)
        return;
    
    selected.map(DOM.deleteCurrent);
}

/**
 * rename current file
 *
 * @currentFile
 */
export function scrollIntoViewIfNeeded(element, center = false) {
    if (!element || !element.scrollIntoViewIfNeeded)
        return;
    
    element.scrollIntoViewIfNeeded(center);
}

/* scroll on one page */
export function scrollByPages(element, pPages) {
    const ret = element?.scrollByPages && pPages;
    
    if (ret)
        element.scrollByPages(pPages);
    
    return ret;
}

export function changePanel() {
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
}

export function getPackerExt(type) {
    if (type === 'zip')
        return '.zip';
    
    return '.tar.gz';
}

export async function goToDirectory(overrides = {}) {
    const {Dialog} = DOM;
    const {prompt = Dialog.prompt, changeDir = CloudCmd.changeDir} = overrides;
    
    const msg = 'Go to directory:';
    const {dirPath} = CurrentInfo;
    
    const [cancel, path = dirPath] = await prompt(msg, dirPath);
    
    if (cancel)
        return;
    
    await changeDir(path);
}

export async function duplicatePanel() {
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
    
    await CloudCmd.changeDir(path, {
        panel,
        noCurrent,
    });
}

export async function swapPanels() {
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
    
    await CloudCmd.changeDir(path, {
        panel: panelPassive,
        noCurrent: true,
    });
    
    await CloudCmd.changeDir(dirPathPassive, {
        panel,
    });
    
    const length = Info.files.length - 1;
    
    if (currentIndex > length)
        currentIndex = length;
    
    const el = Info.files[currentIndex];
    
    DOM.setCurrentFile(el);
}

export function updateCurrentInfo(currentFile) {
    const info = DOM.CurrentInfo;
    const current = currentFile || DOM.getCurrentFile();
    const files = current.parentElement;
    
    const panelPassive = DOM.getPanel({
        active: false,
    });
    
    const filesPassive = DOM.getFiles(panelPassive);
    const name = DOM.getCurrentName(current);
    
    info.dir = DOM.getCurrentDirName();
    info.dirPath = DOM.getCurrentDirPath();
    info.parentDirPath = DOM.getParentDirPath();
    info.element = current;
    info.ext = getExt(name);
    info.files = Array.from(files.children);
    info.filesPassive = Array.from(filesPassive);
    info.first = files.firstChild;
    info.getData = DOM.getCurrentData;
    info.last = files.lastChild;
    info.link = DOM.getCurrentLink(current);
    info.mode = DOM.getCurrentMode(current);
    info.name = name;
    info.path = DOM.getCurrentPath(current);
    info.panel = files.parentElement || DOM.getPanel();
    info.panelPassive = panelPassive;
    info.size = DOM.getCurrentSize(current);
    info.isDir = DOM.isCurrentIsDir();
    info.isSelected = DOM.isSelected(current);
    info.panelPosition = DOM
        .getPanel()
        .dataset
        .name
        .replace('js-', '');
    info.isOnePanel = info.panel.getAttribute('data-name') === info.panelPassive.getAttribute('data-name');
}
