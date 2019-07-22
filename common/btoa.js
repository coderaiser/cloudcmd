'use strict';

module.exports = (str) => {
    if (typeof btoa === 'function')
        return btoa(str);
    
    return Buffer
        .from(str)
        .toString('base64');
};

