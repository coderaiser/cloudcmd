'use strict';

const merge = require('webpack-merge');

const htmlConfig = require('./.webpack/html');
const cssConfig = require('./.webpack/css');
const jsConfig = require('./.webpack/js');

module.exports = merge([
    jsConfig,
    htmlConfig,
    cssConfig,
]);

