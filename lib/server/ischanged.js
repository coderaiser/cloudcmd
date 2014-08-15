(function() {
    'use strict';
    
    var fs              = require('fs'),
        os              = require('os'),
        
        Util            = require('../util'),
        time            = require('./timem'),
        
        WIN             = process.platform === 'win32',
        
        Times           = {},
        
        DIR             = getDir() || __dirname + '/../../json/',
        NAME_SHORT      = DIR           + 'changes',
        NAME            = NAME_SHORT    + '.json';
        
        makeDir(function(error) {
            if (!error)
                Util.exec.try(function() {
                    Times = require(NAME_SHORT);
                });
        });
    
    function getDir() {
        var dir;
        
        if (os.tmpdir) {
            dir     = os.tmpdir();
            dir     += '/ischanged';
            
            if (!WIN)
                dir += '-' + process.getuid() + '/';
        }
        
        return dir;
    }
    
    function makeDir(callback) {
        var ANY_MASK    = 0,
            umask       = process.umask(ANY_MASK);
        
        fs.mkdir(DIR, function(error) {
            process.umask(umask);
            
            if (error && error.code === 'EEXIST')
                callback();
            else
                callback(error);
        });
    }
    
    
    module.exports = function(name, callback) {
        var readTime = Times[name];
        
        Util.checkArgs(arguments, ['name', 'callback']);
        
        time.get(name, 'raw', function(error, fileTime) {
            var json, timeChanged;
            
            if (!error && readTime !== fileTime) {
                timeChanged     = true;
                Times[name]     = fileTime;
                json            = Util.stringifyJSON(Times);
                
                fs.writeFile(NAME, json, function(error) {
                    if (error)
                        Util.log(error);
                });
            }
            
            callback(error, timeChanged);
        });
    };
})();
