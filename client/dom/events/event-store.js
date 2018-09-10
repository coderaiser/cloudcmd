'use strict';

let list = [];

module.exports.add = (el, name, fn) => {
    list.push([
        el,
        name,
        fn,
    ]);
};

module.exports.clear = () => {
    list = [];
};

module.exports.get = () => {
    return list;
};

