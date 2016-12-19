'use strict';

const config = require('./config');
const mellow = require('mellow');

module.exports = (dir) => {
    const root = config('root') || '/';
    
    return mellow.pathToWin(dir, root);
};

