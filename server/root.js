'use strict';

const mellow = require('mellow');

module.exports = (dir, root) => {
    return mellow.webToWin(dir, root || '/');
};

