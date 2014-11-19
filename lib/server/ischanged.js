(function() {
    'use strict';
    
    var fs              = require('fs'),
        os              = require('os'),
        
        Util            = require('../util'),
        time            = require('./timem'),
        
        mkdir           = fs.mkdir,
        
        WIN             = process.platform === 'win32',
        
        Times           = {},
        
        TimesReaded,
        
        DIR             = getDir() || __dirname + '/../../json/',
        NAME_SHORT      = DIR           + 'changes',
        NAME            = NAME_SHORT    + '.json';
    
    function getTimes(callback) {
        if (TimesReaded)
            callback(Times);
        else
            makeDir(DIR, function(error) {
                if (!error)
                    Util.exec.try(function() {
                        Times = require(NAME_SHORT);
                    });
                
                TimesReaded = true;
                
                callback(Times);
            });
    }
    
    function getDir() {
        var dir,
            sign    = '-';
        
        Util.exec.try(function() {
            mkdir   = require('mkdirp');
            sign    = '/';
        });
        
        if (os.tmpdir) {
            dir     = os.tmpdir();
            dir     += '/ischanged';
            
            if (!WIN)
                dir += sign + process.getuid();
            
            dir     += '/';
        }
        
        return dir;
    }
    
    function makeDir(dir, callback) {
        var ANY_MASK    = 0,
            umask       = process.umask(ANY_MASK);
        
        mkdir(dir, function(error) {
            process.umask(umask);
            
            if (error && error.code === 'EEXIST')
                callback();
            else
                callback(error);
        });
    }
    
    
    module.exports = function(name, callback) {
        Util.check(arguments, ['name', 'callback']);
        
        getTimes(function(times) {
            var readTime = times[name];
            
            time(name, 'raw', function(error, fileTime) {
                var json, timeChanged;
                
                if (!error && readTime !== fileTime) {
                    timeChanged     = true;
                    Times[name]     = fileTime;
                    json            = Util.json.stringify(Times);
                    
                    fs.writeFile(NAME, json, function(error) {
                        if (error)
                            Util.log(error);
                    });
                }
                
                callback(error, timeChanged);
            });
        });
    };
})();
