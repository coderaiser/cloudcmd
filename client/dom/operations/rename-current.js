'use strict';

/* global CloudCmd */
const capitalize = require('just-capitalize');

const _Dialog = require('#dom/dialog');
const Storage = require('#dom/storage');
const RESTful = require('#dom/rest');

const _currentFile = require('../current-file.mjs');

module.exports = async (current, overrides = {}) => {
    const {
        refresh = CloudCmd.refresh,
        Dialog = _Dialog,
        currentFile = _currentFile,
    } = overrides;
    
    const {
        isCurrentFile,
        getCurrentName,
        getCurrentFile,
        getCurrentByName,
        getCurrentType,
        getCurrentDirPath,
        setCurrentName,
    } = currentFile;
    
    if (!isCurrentFile(current))
        current = getCurrentFile();
    
    const from = getCurrentName(current);
    
    if (from === '..')
        return Dialog.alert.noFiles();
    
    const [cancel, to] = await Dialog.prompt('Rename', from);
    
    if (cancel)
        return;
    
    const nextFile = getCurrentByName(to);
    
    if (nextFile) {
        const type = getCurrentType(nextFile);
        const msg = `${capitalize(type)} "${to}" already exists. Proceed?`;
        const [cancel] = await Dialog.confirm(msg);
        
        if (cancel)
            return;
    }
    
    if (from === to)
        return;
    
    const dirPath = getCurrentDirPath();
    
    const fromFull = `${dirPath}${from}`;
    const toFull = `${dirPath}${to}`;
    
    const [e] = await RESTful.rename(fromFull, toFull);
    
    if (e)
        return;
    
    setCurrentName(to, current);
    
    Storage.remove(dirPath);
    refresh();
};
