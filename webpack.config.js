'use strict';

const deepmerge = require('deepmerge');

const isSimpleObject = ({constructor}) => constructor === Object;
const {isArray} = Array;
const isMergeableObject = (a) => isArray(a) || isSimpleObject(a);

const htmlConfig = require('./.webpack/html');
const cssConfig = require('./.webpack/css');
const jsConfig = require('./.webpack/js');

module.exports = deepmerge.all([
    jsConfig,
    htmlConfig,
    cssConfig,
], {isMergeableObject});

