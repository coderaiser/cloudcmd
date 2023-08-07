'use strict';

const isString = (a) => typeof a === 'string';

module.exports = (value) => {
    if (!isString(value))
        return '';
    
    if (value.length === 1)
        return '';
    
    if (value && !value.includes('/'))
        return `/${value}`;
    
    return value;
};
