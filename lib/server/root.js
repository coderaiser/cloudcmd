'use strict';

var config = require('./config');
var mellow = require('mellow');

module.exports = function(dir) {
    var root = config('root') || '/';
    
    return mellow.pathToWin(dir, root);
};

