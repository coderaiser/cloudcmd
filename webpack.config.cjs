'use strict';

const {merge} = require('webpack-merge');

const htmlConfig = require('./.webpack/html.cjs');
const cssConfig = require('./.webpack/css.cjs');
const jsConfig = require('./.webpack/js.cjs');

module.exports = merge([
    jsConfig,
    htmlConfig,
    cssConfig,
]);

