'use strict';

const version = require('../../package').version;
const format = require('format-io');

const getMemory = () => {
    const rss = process.memoryUsage().rss;
    return format.size(rss);
};

module.exports = () => ({
    version,
    memory: getMemory(),
});

