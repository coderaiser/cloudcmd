'use strict';

const {getExt} = require('../../../common/util');

module.exports = (name) => {
    const ext = getExtension(name);
    
    return name.replace(ext, '');
};

function getExtension(name) {
    if (/\.tar\.gz$/.test(name))
        return '.tar.gz';
    
    if (/\.tar\.bz2$/.test(name))
        return '.tar.bz2';
    
    return getExt(name);
}

