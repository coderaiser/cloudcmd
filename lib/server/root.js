(function() {
    'use strict';
    
    var DIR     = './',
        path    = require('path'),
        config  = require(DIR + 'config'),
        mellow  = require('mellow'),
        log     = require('debug')('cloudcmd-root');
    
    module.exports = function(dir) {
        var root = config('root') || '/';
        
        if (dir === '/')
            dir = root;
        else
            if (root === '/')
                dir = mellow.pathToWin(dir);
            else
                dir = path.join(root, dir);
        
        log(dir);
        
        return dir;
    };
})();
