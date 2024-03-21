'use strict';

const mellow = require('mellow');

module.exports = (dir, root, {webToWin = mellow.webToWin} = {}) => {
    return webToWin(dir, root || '/');
};
