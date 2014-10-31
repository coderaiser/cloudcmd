(function() {
    'use strict';
    
    var DIR         = './',
        DIR_LIB     = DIR + '../',
        
        path        = require('path'),
        fs          = require('fs'),
        
        tryRequire  = require(DIR + 'tryRequire'),
        
        tar         = tryRequire('tar'),
        fstream     = tryRequire('fstream'),
        
        Util        = require(DIR_LIB + 'util'),
        pipe        = require(DIR + 'pipe');
    
    exports.gzip    = function(from, to, callback) {
        isDir(from, function(is) {
            var options = {
                gzip: true
            };
            
            if (!is || !fstream || !tar)
                pipe(from, to, options, callback);
            else
                createTar(from, function(readStream) {
                    var dir, name,
                        isStr   = Util.type.string(to);
                    
                    if (isStr) {
                        dir     = path.dirname(to),
                        name    = path.basename(to, '.zip');
                        to      = dir + path.sep + name + '.tar.gz';
                    }
                    
                    pipe(readStream, to, options, callback);
                });
        });
    };
    
    exports.gunzip  = function(from, to, callback) {
        var write,
            isStr   = Util.type.string(from),
            check   = Util.checkExt,
            isTarGz = isStr &&  check(from, 'tar.gz'),
            
            options = {
                gunzip    : true
            };
        
        if (tar && isTarGz) {
            write   = tar.Extract({ path: to });
        } else {
            write   = to;
        }
        
        pipe(from, write, options, callback);
    };
    
    function createTar(from, callback) {
        var options = { path: from, type: 'Directory' },
            stream  = fstream.Reader(options)
                        .pipe(tar.Pack({ noProprietary: true }));
        
        callback(stream);
    }
    
    function isDir(name, callback) {
        fs.stat(name, function(error, stat) {
            var isDir;
            
            if (!error)
                isDir = stat.isDirectory();
            
            callback(isDir);
        });
    }
})();
