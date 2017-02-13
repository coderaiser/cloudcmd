'use strict';

const itype = require('itype/legacy');
const jonny = require('jonny');
const exec = require('execon');

/* приватный переключатель возможности работы с кэшем */
var Allowed;

/* функция проверяет возможно ли работать с кэшем каким-либо образом */
module.exports.isAllowed = () => {
    return Allowed && !!localStorage;
};

/**
 * allow Storage usage
 */
module.exports.setAllowed = (isAllowed) => {
    Allowed = isAllowed;
};

/** remove element */
module.exports.remove = (item, callback) => {
    if (Allowed)
        localStorage.removeItem(item);
    
    exec(callback, null, Allowed);
    
    return module.exports;
};

module.exports.removeMatch = (string, callback) => {
    var reg = RegExp('^' + string + '.*$');
    
    Object.keys(localStorage).forEach((name) => {
        const is = reg.test(name);
        
        if (is)
            localStorage.removeItem(name);
    });
    
    exec(callback);
    
    return module.exports;
};

/** если доступен localStorage и
 * в нём есть нужная нам директория -
 * записываем данные в него
 */
module.exports.set = (name, data, callback) => {
    var str, error;
    
    if (itype.object(data))
        str = jonny.stringify(data);
    
    if (Allowed && name)
        error = exec.try(() => {
            localStorage.setItem(name, str || data);
        });
    
    exec(callback, error);
    
    return module.exports;
},

/** Если доступен Storage принимаем из него данные*/
module.exports.get = (name, callback) => {
    var ret;
    
    if (Allowed)
        ret = localStorage.getItem(name);
    
    exec(callback, null, ret);
        
    return module.exports;
},

/** функция чистит весь кэш для всех каталогов*/
module.exports.clear = (callback) => {
    var ret = Allowed;
    
    if (ret)
        localStorage.clear();
    
    exec(callback, null, ret);
    
    return module.exports;
};

