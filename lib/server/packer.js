(function() {
    'use strict';
    
    var DIR         = './',
        DIR_LIB     = DIR + '../',
        
        path        = require('path'),
        fs          = require('fs'),
        zlib        = require('zlib'),
        
        tryRequire  = require(DIR + 'tryRequire'),
        
        tar         = tryRequire('tar'),
        fstream     = tryRequire('fstream'),
        
        Util        = require(DIR_LIB + 'util'),
        pipe        = require(DIR + 'pipe');
    
    exports.pack    = function(from, to, callback) {
        isDir(from, function(is) {
            var dir, name,
                
                optionsDir  = { path: from, type: 'Directory' },
                optionsTar  = { noProprietary: true },
                
                streamDir,
                streamTar,
                streamZip   = zlib.createGzip(),
                streamFile,
                
                isStr   = Util.type.string(to), 
                options = {
                    gzip: true
                };
            
            if (!is || !fstream || !tar) {
                pipe(from, to, options, callback);
            } else {
                streamDir   = fstream.Reader(optionsDir);
                streamTar   = tar.Pack(optionsTar);
                    
                if (!isStr) {
                    streamFile  = to;
                } else {
                    dir     = path.dirname(to);
                    name    = path.basename(to, '.gz');
                    to      = dir + path.sep + name + '.tar.gz';
                    
                    streamFile = fs.createWriteStream(to);
                }
                
                pipe.all([
                    streamDir,
                    streamTar,
                    streamZip,
                    streamFile
                ], callback);
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
