'use strict';

const mellow = require('mellow');

module.exports = (dir, root) => {
    return mellow.pathToWin(dir, root || '/');
};

