'use strict';

module.exports = (value) => {
    if (typeof value !== 'string')
        return '';
    
    if (value.length === 1)
        return '';
    
    if (value && !value.includes('/'))
        return `/${value}`;
    
    return value;
};

