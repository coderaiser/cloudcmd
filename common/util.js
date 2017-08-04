'use strict';

const exec = require('execon');
const jonny = require('jonny');
const Scope = global || window;

module.exports.getStrBigFirst = getStrBigFirst;
module.exports.kebabToCamelCase = kebabToCamelCase;
module.exports.json = jonny;

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
        let is = item.name === name;
        const isArray = Array.isArray(item);
        
        if (is)
            ret = item;
        else if (isArray)
            item.some((item) => {
                is = item.name === name;
                
                if (is)
                    ret = item.data;
                
                return is;
            });
        
        return is;
    });
    
    return ret;
};

/**
 * start timer
 * @param name
 */
module.exports.time = (name) => {
    exec.ifExist(Scope.console, 'time', [name]);
};

/**
 * stop timer
 * @param name
 */
module.exports.timeEnd = (name) => {
    exec.ifExist(Scope.console, 'timeEnd', [name]);
};

function getStrBigFirst(str) {
    if (!str)
        throw Error('str could not be empty!');
    
    const first = str[0].toUpperCase();
    
    return first + str.slice(1);
}

function kebabToCamelCase(str) {
    if (!str)
        throw Error('str could not be empty!');
    
    return str
        .split('-')
        .map(getStrBigFirst)
        .join('')
        .replace(/.js$/, '');
}

