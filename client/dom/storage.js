'use strict';

const tryCatch = require('try-catch');
const {parse, stringify} = JSON;

module.exports.set = async (name, data) => {
    localStorage.setItem(name, data);
};

module.exports.setJson = async (name, data) => {
    localStorage.setItem(name, stringify(data));
};

module.exports.get = async (name) => {
    return localStorage.getItem(name);
};

module.exports.getJson = async (name) => {
    const data = localStorage.getItem(name);
    const [, result = data] = tryCatch(parse, data);
    
    return result;
};

module.exports.clear = () => {
    localStorage.clear();
};

module.exports.remove = (item) => {
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

