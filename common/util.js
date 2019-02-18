'use strict';

const exec = require('execon');

module.exports.escapeRegExp = (str) => {
    const isStr = typeof str === 'string';
    
    if (isStr)
        str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    
    return str;
};

/**
 * get regexp from wild card
 */
module.exports.getRegExp = (wildcard) => {
    wildcard = wildcard || '*';
    
    const escaped = '^' + wildcard // search from start of line
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?') + '$'; // search to end of line
    
    return RegExp(escaped);
};

module.exports.exec = exec;

/**
 * function gets file extension
 *
 * @param name
 * @return ext
 */
module.exports.getExt = (name) => {
    const isStr = typeof name === 'string';
    
    if (!isStr)
        return '';
    
    const dot = name.lastIndexOf('.');
    
    if (~dot)
        return name.substr(dot);
    
    return '';
};

/**
 * find object by name in arrray
 *
 * @param array
 * @param name
 */
module.exports.findObjByNameInArr = (array, name) => {
    let ret;
    
    if (!Array.isArray(array))
        throw Error('array should be array!');
    
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    array.some((item) => {
        const is = item.name === name;
        const isArray = Array.isArray(item);
        
        if (is) {
            ret = item;
            return is;
        }
        
        if (!isArray)
            return is;
        
        return item.some((item) => {
            const is = item.name === name;
            
            if (is)
                ret = item.data;
            
            return is;
        });
    });
    
    return ret;
};

/**
 * start timer
 * @param name
 */
module.exports.time = (name) => {
    exec.ifExist(console, 'time', [name]);
};

/**
 * stop timer
 * @param name
 */
module.exports.timeEnd = (name) => {
    exec.ifExist(console, 'timeEnd', [name]);
};

