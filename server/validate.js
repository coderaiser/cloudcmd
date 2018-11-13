'use strict';

const tryCatch = require('try-catch');

const config = require('./config');
const exit = require('./exit');
const columns = require('./columns');

module.exports.root = (dir, fn) => {
    if (typeof dir !== 'string')
        throw Error('dir should be a string');
    
    if (dir === '/')
        return;
    
    if (config('dropbox'))
        return;
    
    const {statSync} = require('fs');
    const [error] = tryCatch(statSync, dir);
    
    if (error)
        return exit('cloudcmd --root: %s', error.message);
    
    if (typeof fn === 'function')
        fn('root:', dir);
};

module.exports.editor = (name) => {
    const reg = /^(dword|edward|deepword)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
};

module.exports.packer = (name) => {
    const reg = /^(tar|zip)$/;
    
    if (!reg.test(name))
        exit('cloudcmd --packer: could be "tar" or "zip" only');
};

module.exports.columns = (type) => {
    const addQuotes = (a) => `"${a}"`;
    const all = Object
        .keys(columns)
        .concat('');
    
    const names = all
        .filter(Boolean)
        .map(addQuotes)
        .join(', ');
    
    if (!~all.indexOf(type))
        exit(`cloudcmd --columns: can be only one of: ${names}`);
};

