'use strict';

module.exports.set = async (name, data) => {
    localStorage.setItem(name, data);
};

module.exports.get = async (name) => {
    return localStorage.getItem(name);
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

