'use strict';

const format = require('format-io');

const {version} = require('../../package');

const getMemory = () => {
    const {rss} = process.memoryUsage();
    return format.size(rss);
};

module.exports = (prefix) => ({
    version,
    prefix,
    memory: getMemory(),
});

