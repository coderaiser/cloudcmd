/**
 * Parse a `data-name` attribute string back into the original filename
 * @param attribute The string we wish to decode
 */

'use strict';

/* global DOM */
/* global CloudCmd */

const {atob, btoa} = require('../../common/base64');
const createElement = require('@cloudcmd/create-element');

const {
    encode,
    decode,
} = require('../../common/entity');

const {
    getTitle,
    FS,
} = require('../../common/cloudfunc');

let Title;

const CURRENT_FILE = 'current-file';
const NBSP_REG = RegExp(String.fromCharCode(160), 'g');
const SPACE = ' ';

module.exports._CURRENT_FILE = CURRENT_FILE;

/**
 * set name from current (or param) file
 *
 * @param name
 * @param current
 */
module.exports.setCurrentName = (name, current) => {
    const Info = DOM.CurrentInfo;
    const {link} = Info;
    const {prefix} = CloudCmd;
    const dir = prefix + FS + Info.dirPath;
    const encoded = encode(name);
    
    link.title = encoded;
    link.href = dir + encoded;
    link.innerHTML = encoded;
    
    current.setAttribute('data-name', createNameAttribute(name));
    CloudCmd.emit('current-file', current);
    
    return link;
};

/**
 * get name from current (or param) file
 *
 * @param currentFile
 */
module.exports.getCurrentName = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    
    if (!current)
        return '';
    
    return parseNameAttribute(current.getAttribute('data-name'));
};

/**
 * Generate a `data-name` attribute for the given filename
 * @param name The string name to encode
 */
const createNameAttribute = (name) => {
    const encoded = btoa(encodeURI(name));
    return `js-file-${encoded}`;
};

/**
 * Parse a `data-name` attribute string back into the original filename
 * @param attribute The string we wish to decode
 */
const parseNameAttribute = (attribute) => {
    attribute = attribute.replace('js-file-', '');
    return decodeURI(atob(attribute));
};

/**
 * get current direcotory path
 */
module.exports.getCurrentDirPath = (panel = DOM.getPanel()) => {
    const path = DOM.getByDataName('js-path', panel);
    return path.textContent
        .replace(NBSP_REG, SPACE);
};

/**
 * get link from current (or param) file
 *
 * @param currentFile - current file by default
 */
module.exports.getCurrentPath = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const [element] = DOM.getByTag('a', current);
    const {prefix} = CloudCmd;
    
    const path = element
        .getAttribute('href')
        .replace(RegExp('^' + prefix + FS), '')
        .replace(NBSP_REG, SPACE);
    
    return decode(path);
};

/**
 * get current direcotory name
 */
module.exports.getCurrentDirName = () => {
    const href = DOM.getCurrentDirPath()
        .replace(/\/$/, '');
    
    const substr = href.substr(href, href.lastIndexOf('/'));
    const ret = href.replace(substr + '/', '') || '/';
    
    return ret;
};

/**
 * get current direcotory path
 */
module.exports.getParentDirPath = (panel) => {
    const path = DOM.getCurrentDirPath(panel);
    const dirName = DOM.getCurrentDirName() + '/';
    const index = path.lastIndexOf(dirName);
    
    if (path === '/')
        return path;
    
    return path.slice(0, index);
};

/**
 * get not current direcotory path
 */
module.exports.getNotCurrentDirPath = () => {
    const panel = DOM.getPanel({
        active: false,
    });
    
    return DOM.getCurrentDirPath(panel);
};

/**
 * unified way to get current file
 *
 * @currentFile
 */
module.exports.getCurrentFile = () => {
    return DOM.getByClass(CURRENT_FILE);
};

/**
 * get current file by name
 */
module.exports.getCurrentByName = (name, panel = DOM.CurrentInfo.panel) => {
    const dataName = 'js-file-' + btoa(encodeURI(name));
    return DOM.getByDataName(dataName, panel);
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
module.exports.setCurrentFile = (currentFile, options) => {
    const o = options;
    const currentFileWas = DOM.getCurrentFile();
    
    if (!currentFile)
        return DOM;
    
    let pathWas = '';
    
    if (currentFileWas) {
        pathWas = DOM.getCurrentDirPath();
        unsetCurrentFile(currentFileWas);
    }
    
    currentFile.classList.add(CURRENT_FILE);
    
    const path = DOM.getCurrentDirPath();
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
    const CENTER = true;
    DOM.scrollIntoViewIfNeeded(currentFile, CENTER);
    
    CloudCmd.emit('current-file', currentFile);
    CloudCmd.emit('current-path', path);
    CloudCmd.emit('current-name', DOM.getCurrentName(currentFile));
    
    return DOM;
};

this.setCurrentByName = (name) => {
    const current = DOM.getCurrentByName(name);
    return DOM.setCurrentFile(current);
};

/*
  * set current file by position
  *
  * @param layer    - element
  * @param          - position {x, y}
  */
module.exports.getCurrentByPosition = ({x, y}) => {
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
 * current file check
 *
 * @param currentFile
 */
module.exports.isCurrentFile = (currentFile) => {
    if (!currentFile)
        return false;
    
    return DOM.isContainClass(currentFile, CURRENT_FILE);
};

/**
 * set title or create title element
 *
 * @param name
 */

module.exports.setTitle = (name) => {
    if (!Title)
        Title = DOM.getByTag('title')[0] || createElement('title', {
            innerHTML: name,
            parent: document.head,
        });
    
    Title.textContent = name;
    
    return DOM;
};

/**
 * check is current file is a directory
 *
 * @param currentFile
 */
module.exports.isCurrentIsDir = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const path = DOM.getCurrentPath(current);
    const fileType = DOM.getCurrentType(current);
    
    const isZip = /\.zip$/.test(path);
    const isDir = /^directory(-link)?/.test(fileType);
    
    return isDir || isZip;
};

module.exports.getCurrentType = (currentFile) => {
    const current = currentFile || DOM.getCurrentFile();
    const el = DOM.getByDataName('js-type', current);
    const type = el.className
        .split(' ')
        .pop();
    
    return type;
};

