'use strict';

const {statSync: _statSync} = require('node:fs');
const tryCatch = require('try-catch');

const _exit = require('./exit');
const {getColumns: _getColumns} = require('./columns');
const isString = (a) => typeof a === 'string';

module.exports.root = (dir, config, {exit = _exit, statSync = _statSync} = {}) => {
    if (!isString(dir))
        throw Error('dir should be a string');
    
    if (dir === '/')
        return;
    
    if (config('dropbox'))
        return;
    
    const [error] = tryCatch(statSync, dir);
    
    if (error)
        return exit('cloudcmd --root: %s', error.message);
};

module.exports.editor = (name, {exit = _exit} = {}) => {
    const reg = /^(dword|edward|deepword)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
};

module.exports.packer = (name, {exit = _exit} = {}) => {
    const reg = /^(tar|zip)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --packer: could be "tar" or "zip" only');
};

module.exports.columns = (type, {exit = _exit, getColumns = _getColumns} = {}) => {
    const addQuotes = (a) => `"${a}"`;
    const all = Object
        .keys(getColumns())
        .concat('');
    
    const names = all
        .filter(Boolean)
        .map(addQuotes)
        .join(', ');
    
    if (!all.includes(type))
        exit(`cloudcmd --columns: can be only one of: ${names}`);
};
