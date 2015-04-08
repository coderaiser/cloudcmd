(function() {
    'use strict';
    
    var DIR     = './',
        config  = require(DIR + 'config'),
        mellow  = require('mellow');
    
    module.exports = function(dir) {
        var root = config('root') || '/';
        
        dir = mellow.pathToWin(dir, root);
        
        return dir;
    };
})();
