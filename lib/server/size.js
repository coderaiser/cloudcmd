/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    var fs          = require('fs'),
        path        = require('path'),
        
        DIR         = '../',
        
        format      = require(DIR   + 'format'),
        Util        = require(DIR   + 'util'),
        
        /*  The lstat() function shall be equivalent to stat(),
            except when path refers to a symbolic link. In that case lstat()
            shall return information about the link, while stat() shall return
            information about the file the link references. 
        */
        stat    = fs.lstat;
    
    exports.get = function(dir, options, callback) {
        var type, stopOnError,
            total           = 0;
        
        Util.check(arguments, ['dir', 'callback']);
        
        if (!callback) {
            callback    = options;
        } else {
            type        = options.type;
            stopOnError = options.stopOnError;
        }
        
        function calcSize(size) {
            total      += size || 0;
        }
        
        processDir(dir, calcSize, options, function(error) {
            var result;
            
            if (type !== 'raw')
                result  = format.size(total);
            else
                result  = total;
            
            callback(error, result);
        });
    };
   
    function processDir(dir, func, options, callback) {
        var stopOnError     = options.stopOnError,
            wasError        = false,
            asyncRunning    = 0,
            fileCounter     = 1,
            
            execCallBack    = function () {
                var noErrors    = !wasError || !stopOnError,
                    yesAllDone   = !fileCounter && !asyncRunning;
                
                if (yesAllDone && noErrors)
                    callback();
            },
            
            getDirInfo      = function(dir) {
               stat(dir, Util.exec.with(getStat, dir));
            };
        
        getDirInfo(dir);
        
        function getStat(dir, error, stat) {
            var isDir;
            
            --fileCounter;
            
            if (!wasError || !stopOnError) {
                if (error) {
                    if (stopOnError) {
                        wasError    = true;
                        callback(error);
                    }
                } else {
                    isDir   = stat.isDirectory();
                    
                    if (!isDir)
                        func(stat.size);
                    else if (isDir) {
                        ++asyncRunning;
                        
                        fs.readdir(dir, function(error, files) {
                            onReaddir(error, files, dir);
                        });
                    }
                }
                
                execCallBack();
            }
        }
        
        function onReaddir(error, files, dir) {
            var n;
            
            asyncRunning--;
            
            if (!error) {
                n               = files.length;
                fileCounter    += n;
                
                files.forEach(function(file) {
                    var dirPath     = path.join(dir, file);
                    
                    process.nextTick(function() {
                        getDirInfo(dirPath);
                    });
                });
            }
            
            if (!n)
                execCallBack();
        }
    }
    
})();
