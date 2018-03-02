'use strict';

const exit = require('./exit');
const columns = require('./columns');

module.exports.root = (dir, fn) => {
    if (typeof dir !== 'string')
        throw Error('dir should be a string');
    
    if (dir === '/')
        return;
    
    const fs = require('fs');
    
    fs.stat(dir, (error) => {
        if (error)
            return exit('cloudcmd --root: %s', error.message);
        
        if (typeof fn === 'function')
            fn('root:', dir);
    });
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
    const all = Object
        .keys(columns)
        .concat('');
    
    if (!~all.indexOf(type))
        exit('cloudcmd --columns: could be "name-size-date" or "name-size-date-owner-mode"');
};

