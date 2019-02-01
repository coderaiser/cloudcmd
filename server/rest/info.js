'use strict';

const format = require('format-io');

const {version} = require('../../package');
const config = require('../config');

const getMemory = () => {
    const {rss} = process.memoryUsage();
    return format.size(rss);
};

module.exports = () => ({
    version,
    memory: getMemory(),
    prefix: config('prefix'),
});

