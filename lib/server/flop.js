/*
 * FLOP - FiLe OPerations
 */

(function() {
    
    var fs          = require('fs'),
        DIR         = './',
        
        Util        = require(DIR + '../util'),
        
        dir         = require(DIR + 'dir'),
        commander   = require(DIR + 'commander'),
        time        = require(DIR + 'time'),
        Hash        = require(DIR + 'hash'),
        pipe        = require(DIR + 'pipe'),
        
        fse         =  {
            mkdir   : tryRequire('mkdirp') || fs.mkdir.bind(fs),
        };
    
    exports.create  = function(path, type, callback) {
        Util.checkArgs(arguments, ['path', 'callback']);
        
        if (!callback) {
            callback    = type;
            type        = 'file';
        }
        
        if (!type)
            type        = 'file';
        
        switch(type) {
        case 'file':
            fs.writeFile(path, '', callback);
            break;
        
        case 'dir':
            fse.mkdir(path, callback);
            break;
        }
    };
    
    exports.read    = function(path, type, callback) {
        var hash, error;
        
        Util.checkArgs(arguments, ['path', 'callback']);
        
        if (!callback)
            callback = type;
        
        switch (type) {
        case 'size':
            dir.getSize(path, callback);
            break;
            
        case 'time':
            time.get(path, function(error, time) {
                var timeStr;
                
                if (!error)
                    timeStr = time.toString();
                
                callback(error, timeStr);
            });
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'hash: not suported, try update node';
                callback(new Error(error));
            } else
                pipe.create(path, hash, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hash.get();
                    
                    callback(error, hex);
                });
            break;
        
        default:
            dir.isDir(path, function(error, isDir) {
                var getDirContent   = commander.getDirContent;
                
                if (isDir && !error)
                    getDirContent(path, callback);
                else
                    callback(error, null, !isDir);
            });
            break;
        }
    };
    
    exports.write   = function() {
        
    };
    
    exports.delete  = function() {
        
    };
    
    exports.mv      = function() {
        
    };
    
    exports.cp      = function() {
        
    };
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
})();
