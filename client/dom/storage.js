'use strict';

const itype = require('itype/legacy');
const jonny = require('jonny/legacy');
const exec = require('execon');
const tryCatch = require('try-catch');
const setItem = localStorage.setItem.bind(localStorage);

/** remove element */
module.exports.remove = (item, callback) => {
    localStorage.removeItem(item);
    exec(callback, null);
    
    return module.exports;
};

module.exports.removeMatch = (string, callback) => {
    const reg = RegExp('^' + string + '.*$');
    const test = (a) => reg.test(a);
    const remove = (a) => localStorage.removeItem(a);
    
    Object.keys(localStorage)
        .filter(test)
        .forEach(remove);
    
    exec(callback);
    
    return module.exports;
};

/** если доступен localStorage и
 * в нём есть нужная нам директория -
 * записываем данные в него
 */
module.exports.set = (name, data, callback) => {
    let str;
    let error;
    
    if (itype.object(data))
        str = jonny.stringify(data);
    
    if (name)
        [error] = tryCatch(setItem, name, str || data);
    
    exec(callback, error);
    
    return module.exports;
};

/** Если доступен Storage принимаем из него данные*/
module.exports.get = (name, callback) => {
    const ret = localStorage.getItem(name);
    
    exec(callback, null, ret);
    
    return module.exports;
};

/** функция чистит весь кэш для всех каталогов*/
module.exports.clear = (callback) => {
    localStorage.clear();
    
    exec(callback);
    
    return module.exports;
};

