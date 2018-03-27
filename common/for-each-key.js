'use strict';

const currify = require('currify/legacy');
const setValue = currify((fn, obj, key) => fn(key, obj[key]));

module.exports = (fn, obj) => {
    Object
        .keys(obj)
        .forEach(setValue(fn, obj));
};

