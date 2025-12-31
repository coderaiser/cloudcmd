'use strict';

const {getExt} = require('../../../common/util');

module.exports = (name) => {
    const ext = getExtension(name);
    
    return name.replace(ext, '');
};

function getExtension(name) {
    if (name.endsWith('.tar.gz'))
        return '.tar.gz';
    
    if (name.endsWith('.tar.bz2'))
        return '.tar.bz2';
    
    return getExt(name);
}
