/* global DOM, CloudCmd */

'use strict';

const exec = require('execon');
const itype = require('itype');
const currify = require('currify');
const tryToCatch = require('try-to-catch');
const clipboard = require('@cloudcmd/clipboard');

const getRange = require('./get-range');
const getIndex = currify(require('./get-index'));
const uploadFiles = require('../dom/upload-files');

const {FS} = require('../../common/cloudfunc');

const NBSP_REG = RegExp(String.fromCharCode(160), 'g');
const SPACE = ' ';

module.exports.init = async () => {
    await Promise.all([
        contextMenu(),
        dragndrop(),
        unload(),
        pop(),
        resize(),
        header(),
        config(),
    ]);
};

CloudCmd.Listeners = module.exports;

const unselect = (event) => {
    const isMac = /Mac/.test(window.navigator.platform);
    const {
        shiftKey,
        metaKey,
        ctrlKey,
    } = event;
    
    if (shiftKey || isMac && metaKey || ctrlKey)
        return;
    
    DOM.unselectFiles();
};

const execAll = currify((funcs, event) => {
    for (const fn of funcs)
        fn(event);
});

const Info = DOM.CurrentInfo;
const {Events} = DOM;
const EventsFiles = {
    mousedown: exec.with(execIfNotUL, setCurrentFileByEvent),
    click: execAll([
        onClick,
        unselect,
    ]),
    dragstart: exec.with(execIfNotUL, onDragStart),
    dblclick: exec.with(execIfNotUL, onDblClick),
    touchstart: exec.with(execIfNotUL, onTouch),
};

let EXT;

function header() {
    const fm = DOM.getFM();
    const isDataset = (el) => el.dataset;
    const isPanel = (el) => {
        return /^js-(left|right)$/.test(el.dataset.name);
    };
    
    Events.addClick(fm, (event) => {
        const el = event.target;
        const parent = el.parentElement;
        
        if (parent.dataset.name !== 'js-fm-header')
            return;
        
        const name = (el.dataset.name || '')
            .replace('js-', '');
        
        if (!/^(name|size|date)$/.test(name))
            return;
        
        const panel = getPath(el)
            .filter(isDataset)
            .filter(isPanel)
            .pop();
        
        CloudCmd.sortPanel(name, panel);
    });
}

function getPath(el, path = []) {
    if (!el)
        return path;
    
    return getPath(el.parentElement, path.concat(el));
}

async function config() {
    const [, config] = await tryToCatch(DOM.Files.get, 'config');
    const type = config?.packer;
    
    EXT = DOM.getPackerExt(type);
}

module.exports.initKeysPanel = () => {
    const keysElement = DOM.getById('js-keyspanel');
    
    if (!keysElement)
        return;
    
    Events.addClick(keysElement, ({target}) => {
        const {id} = target;
        const operation = (name) => {
            const {Operation} = CloudCmd;
            const fn = Operation.show.bind(null, name);
            
            return fn;
        };
        
        const clickFuncs = {
            'f1'        : CloudCmd.Help.show,
            'f2'        : initF2,
            'f3'        : CloudCmd.View.show,
            'f4'        : CloudCmd.EditFile.show,
            'f5'        : operation('copy'),
            'f6'        : operation('move'),
            'f7'        : DOM.promptNewDir,
            'f8'        : operation('delete'),
            'f9'        : CloudCmd.Menu.show,
            'f10'       : CloudCmd.Config.show,
            '~'         : CloudCmd.Konsole.show,
            'shift~'    : CloudCmd.Terminal.show,
            'contact'   : CloudCmd.Contact.show,
        };
        
        exec(clickFuncs[id]);
    });
};

function initF2() {
    CloudCmd.UserMenu.show();
}

const getPanel = (side) => {
    if (!itype.string(side))
        return side;
    
    return DOM.getByDataName('js-' + side);
};

module.exports.setOnPanel = (side) => {
    const panel = getPanel(side);
    
    const filesElement = DOM.getByDataName('js-files', panel);
    const pathElement = DOM.getByDataName('js-path', panel);
    
    /* ставим загрузку гифа на клик*/
    Events.addClick(pathElement, getPathListener(panel));
    Events.add(filesElement, EventsFiles);
};

function getPathListener(panel) {
    return onPathElementClick.bind(null, panel);
}

function isNoCurrent(panel) {
    const infoPanel = Info.panel;
    
    if (!infoPanel)
        return true;
    
    const namePanel = panel.getAttribute('data-name');
    const nameInfoPanel = infoPanel.getAttribute('data-name');
    
    return namePanel !== nameInfoPanel;
}

function decodePath(path) {
    const url = CloudCmd.HOST;
    const {prefix} = CloudCmd;
    const prefixReg = RegExp('^' + prefix + FS);
    
    return decodeURI(path)
        .replace(url, '')
        .replace(prefixReg, '')
    // browser doesn't replace % -> %25% do it for him
        .replace('%%', '%25%')
        .replace(NBSP_REG, SPACE) || '/';
}

async function onPathElementClick(panel, event) {
    event.preventDefault();
    
    const element = event.target;
    const attr = element.getAttribute('data-name');
    const noCurrent = isNoCurrent(panel);
    
    if (attr === 'js-copy-path')
        return copyPath(element);
    
    if (attr === 'js-refresh')
        return CloudCmd.refresh({
            panel,
            noCurrent,
        });
    
    if (attr !== 'js-path-link')
        return;
    
    const {href} = element;
    const path = decodePath(href);
    
    await CloudCmd.loadDir({
        path,
        isRefresh: false,
        panel: noCurrent ? panel : Info.panel,
    });
}

function copyPath(el) {
    clipboard.writeText(el.parentElement.title)
        .then(CloudCmd.log)
        .catch(CloudCmd.log);
}

function execIfNotUL(callback, event) {
    const {target} = event;
    const {tagName} = target;
    
    if (tagName !== 'UL')
        callback(event);
}

function onClick(event) {
    event.preventDefault();
    changePanel(event.target);
}

function toggleSelect(key, files) {
    const isMac = /Mac/.test(window.navigator.platform);
    
    if (!key)
        throw Error('key should not be undefined!');
    
    const [file] = files;
    
    if (isMac && key.meta || key.ctrl)
        return DOM.toggleSelectedFile(file);
    
    if (key.shift)
        return files.map(DOM.selectFile);
}

function changePanel(element) {
    const {panel} = Info;
    const files = DOM.getByDataName('js-files', panel);
    const ul = getULElement(element);
    
    if (ul !== files)
        DOM.changePanel();
}

async function onDblClick(event) {
    event.preventDefault();
    
    const current = getLIElement(event.target);
    const isDir = DOM.isCurrentIsDir(current);
    const path = DOM.getCurrentPath(current);
    
    if (!isDir)
        return CloudCmd.View.show();
    
    await CloudCmd.loadDir({
        path,
    });
}

async function onTouch(event) {
    const current = getLIElement(event.target);
    const isDir = DOM.isCurrentIsDir(current);
    
    if (!isDir)
        return;
    
    const isCurrent = DOM.isCurrentFile(current);
    
    if (!isCurrent)
        return;
    
    await CloudCmd.loadDir({
        path: DOM.getCurrentPath(current),
    });
}

/*
  * download file from browser to desktop
  * in Chrome (HTML5)
  */
function onDragStart(event) {
    const {prefixURL} = CloudCmd;
    const element = getLIElement(event.target);
    const {isDir} = Info;
    let link = DOM.getCurrentLink(element);
    let name = DOM.getCurrentName(element);
    
    /* if it's directory - adding json extension */
    if (isDir) {
        name += EXT;
        link = document.createElement('a');
        link.textContent = name;
        link.href = prefixURL + '/pack' + Info.path + EXT;
    }
    
    event.dataTransfer.setData(
        'DownloadURL',
        'application/octet-stream' + ':' +
        name + ':' +
        link,
    );
}

function getLIElement(element) {
    if (!element)
        return element;
    
    while (element.tagName !== 'LI')
        element = element.parentElement;
    
    return element;
}

function getULElement(element) {
    while (element.tagName !== 'UL')
        element = element.parentElement;
    
    return element;
}

function setCurrentFileByEvent(event) {
    const BUTTON_LEFT = 0;
    
    const key = {
        alt: event.altKey,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
        shift: event.shiftKey,
    };
    
    const element = getLIElement(event.target);
    
    const fromName = Info.name;
    DOM.setCurrentFile(element);
    const toName = Info.name;
    
    let files = [];
    
    if (key.shift)
        files = getFilesRange(fromName, toName);
    else
        files.push(Info.element);
    
    if (event.button === BUTTON_LEFT)
        toggleSelect(key, files);
}

function getFilesRange(from, to) {
    const files = DOM.getAllFiles();
    const names = DOM.getFilenames(files);
    const getNameIndex = getIndex(names);
    
    const indexFrom = getNameIndex(from);
    const indexTo = getNameIndex(to);
    
    return getRange(indexFrom, indexTo, files);
}

function contextMenu() {
    const fm = DOM.getFM();
    
    Events.addOnce('contextmenu', fm, (event) => {
        CloudCmd.Menu.show({
            x: event.clientX,
            y: event.clientY,
        });
    });
    
    Events.addContextMenu(fm, (event) => {
        CloudCmd.Menu.ENABLED || event.preventDefault();
    });
}

function dragndrop() {
    const panels = DOM.getByClassAll('panel');
    const select = ({target}) => {
        target.classList.add('selected-panel');
    };
    
    const unselect = ({target}) => {
        target.classList.remove('selected-panel');
    };
    
    const onDrop = (event) => {
        const {
            files,
            items,
        } = event.dataTransfer;
        
        const {length: filesCount} = files;
        
        event.preventDefault();
        
        if (filesCount && (!items || !items.length || !items[0].webkitGetAsEntry))
            return uploadFiles(files);
        
        const isFile = (item) => item.kind === 'file';
        const dirFiles = Array.from(items).filter(isFile);
        
        if (dirFiles.length)
            return DOM.uploadDirectory(dirFiles);
        
        const {Operation} = CloudCmd;
        const operation = event.shiftKey ? 'move' : 'copy';
        
        return Operation.show(operation);
    };
    
    /**
     * In Mac OS Chrome dropEffect = 'none'
     * so drop do not firing up when try
     * to upload file from download bar
     */
    const onDragOver = (event) => {
        const {dataTransfer} = event;
        const {effectAllowed} = dataTransfer;
        
        if (/move|linkMove/.test(effectAllowed))
            dataTransfer.dropEffect = 'move';
        else
            dataTransfer.dropEffect = 'copy';
        
        event.preventDefault();
    };
    
    for (const panel of panels)
        Events
            .add('dragover', panel, onDragOver)
            .add('drop', panel, onDrop)
            .add('dragenter', select)
            .add(['dragleave', 'drop'], unselect);
}

function unload() {
    DOM.Events.add(['unload', 'beforeunload'], (event) => {
        const {Key} = CloudCmd;
        const isBind = Key?.isBind();
        
        if (isBind)
            return;
        
        event.preventDefault();
        return 'Please make sure that you saved all work.';
    });
}

function pop() {
    Events.add('popstate', async ({state}) => {
        const path = (state || '').replace(FS, '');
        
        if (!path)
            return CloudCmd.route(location.hash);
        
        const history = false;
        await CloudCmd.loadDir({
            path,
            history,
        });
    });
}

function resize() {
    Events.add('resize', () => {
        const is = window.innerWidth < CloudCmd.MIN_ONE_PANEL_WIDTH;
        
        if (!is)
            return;
        
        const {panel} = Info;
        const isEmptyRoot = !panel;
        
        if (isEmptyRoot)
            return;
        
        const name = panel.getAttribute('data-name');
        const isLeft = name === 'js-left';
        
        if (isLeft)
            return;
        
        DOM.changePanel();
    });
}

