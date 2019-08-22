'use strict';

const tryCatch = require('try-catch');

const {parse, stringify} = JSON;
const isObj = (a) => typeof a === 'object';

module.exports.set = async (name, data) => {
    const primitive = !isObj(data) ? data : stringify(data);
    
    localStorage.setItem(name, primitive);
};

module.exports.get = async (name) => {
    const data = localStorage.getItem(name);
    const [, result = data] = tryCatch(parse, data);
    
    return result;
};

module.exports.clear = async () => {
    localStorage.clear();
};

module.exports.remove = async(item) => {
    localStorage.removeItem(item);
};

module.exports.removeMatch = (string) => {
    const reg = RegExp('^' + string + '.*$');
    const test = (a) => reg.test(a);
    const remove = (a) => localStorage.removeItem(a);
    
    Object.keys(localStorage)
        .filter(test)
        .forEach(remove);
};

