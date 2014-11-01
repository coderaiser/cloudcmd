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
    
    exports.pack    = function(from, to, callback) {
        isDir(from, function(is) {
            var stream, dir, name,
                isStr   = Util.type.string(to), 
                options = {
                    gzip: true
                };
            
            if (!is || !fstream || !tar) {
                pipe(from, to, options, callback);
            } else {
                stream  = fstream
                    .Reader({ path: from, type: 'Directory' })
                    .on('error', callback)
                    .pipe(tar.Pack({ noProprietary: true }));
                    
                if (isStr) {
                    dir     = path.dirname(to);
                    name    = path.basename(to);
                    to      = dir + path.sep + name + '.tar.gz';
                }
                
                pipe(stream, to, options, callback);
            }
        });
    };
    
    exports.unpack  = function(from, to, callback) {
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
    
    function isDir(name, callback) {
        fs.stat(name, function(error, stat) {
            var isDir;
            
            if (!error)
                isDir = stat.isDirectory();
            
            callback(isDir);
        });
    }
})();
