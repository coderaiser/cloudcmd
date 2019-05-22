'use strict';

const {promisify} = require('es6-promisify');
const wraptile = require('wraptile/legacy');
const tryToCatch = require('try-to-catch/legacy');

module.exports = wraptile((fn, ...args) => {
    const promise = promisify(fn);
    return tryToCatch(promise, ...args);
});

