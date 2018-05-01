'use strict';

/* global DOM */
/* global CloudCmd */

const btoa = require('../../common/btoa');

const {
    encode,
    decode,
} = require('../../common/entity');

const {
    FS,
} = require('../../common/cloudfunc');

const NBSP_REG = RegExp(String.fromCharCode(160), 'g');
const SPACE = ' ';

/**
 * set name from current (or param) file
 *
 * @param name
 * @param current
 */
module.exports.setCurrentName = (name, current) => {
    const Info = DOM.CurrentInfo;
    const {link} = Info;
    const {PREFIX} = CloudCmd;
    const dir = PREFIX + FS + Info.dirPath;
    const encoded = encode(name);
    
    link.title = encoded;
    link.href = dir + encoded;
    link.innerHTML = encoded;
    
    current.setAttribute('data-name', 'js-file-' + btoa(encodeURI(name)));
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
       
    const link = DOM.getCurrentLink(current);
    
    if (!link)
        return '';
    
    return decode(link.title)
        .replace(NBSP_REG, SPACE);
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
    const element = DOM.getByTag('a', current)[0];
    const prefix = CloudCmd.PREFIX;
    
    const path = element
        .getAttribute('href')
        .replace(RegExp('^' + prefix + FS), '')
        .replace(NBSP_REG, SPACE);
    
    return decode(path);
};

