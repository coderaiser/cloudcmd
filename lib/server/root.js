(function() {
    'use strict';
    
    var DIR     = './',
        path    = require('path'),
        config  = require(DIR + 'config'),
        mellow  = require('mellow');
    
    module.exports = function(dir) {
        var root = config('root') || '/';
        
        if (root === '/')
            dir = mellow.pathToWin(dir);
        
        return path.join(root + dir);
    };
})();
