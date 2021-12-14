'use strict';

const isFn = (a) => typeof a === 'function';

module.exports.btoa = (str) => {
    if (isFn(btoa))
        return btoa(str);
    
    return Buffer
        .from(str)
        .toString('base64');
};

module.exports.atob = (str) => {
    if (isFn(atob))
        return atob(str);
    
    return Buffer
        .from(str, 'base64')
        .toString('binary');
};

