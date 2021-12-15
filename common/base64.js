'use strict';

module.exports.btoa = (str) => {
    if (typeof btoa === 'function')
        return btoa(str);
    
    return Buffer
        .from(str)
        .toString('base64');
};

module.exports.atob = (str) => {
    if (typeof atob === 'function')
        return atob(str);
    
    return Buffer
        .from(str, 'base64')
        .toString('binary');
};

