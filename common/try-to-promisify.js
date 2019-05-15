'use strict';

const {promisify} = require('es6-promisify');
const tryToCatch = require('try-to-catch/legacy');

module.exports = (fn, ...args) => {
    const promise = promisify(fn);
    
    return tryToCatch(promise, ...args);
};

