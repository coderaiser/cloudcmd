(function() {
    'use strict';

    var DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        
        isWin       = process.platform === 'win32',
        Util        = require(DIR           + 'util'),
        commander   = require(DIR_SERVER    + 'commander');
    
    exports.read            = read;
    exports.convertPath     = convertPath;
    
    function read(path, callback) {
        if (isWin && path === '/')
            getRoot(callback);
        else
            commander.getDirContent(path, callback);
    }
    
    function getRoot(callback) {
        var win = require(DIR_SERVER + 'win');
        
        win.getVolumes(function(error, volumes) {
            var data = {
                path    : '/',
                files   : []
            };
            
            if (!error)
                data.files = volumes.map(function(volume) {
                    return {
                        name: volume,
                        size: 'dir',
                        mode: '--- --- ---',
                        owner: 0
                    };
                });
            
            callback(error, data);
        });
    }
    
    function convertPath(path) {
        var volume;
        
        Util.checkArgs(arguments, ['path']);
        
        if (isWin && path !== '/') {
            volume  = path[1];
            path    = path.split('')
                          .slice(2)
                          .join('');
            
            path    = volume + ':' + path;
        }
        
        return path;
    }
})();
