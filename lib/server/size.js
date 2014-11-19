/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    var fs          = require('fs'),
        path        = require('path'),
        
        DIR         = '../',
        
        format      = require(DIR   + 'format'),
        Util        = require(DIR   + 'util'),
        
        EventEmitter= require('events').EventEmitter,
        
        /*  The lstat() function shall be equivalent to stat(),
            except when path refers to a symbolic link. In that case lstat()
            shall return information about the link, while stat() shall return
            information about the file the link references. 
        */
        stat    = fs.lstat;
    
    exports.get = function(dir, options, callback) {
        var type, stopOnError,
            emitter         = new EventEmitter(),
            total           = 0;
        
        Util.check(arguments, ['dir', 'callback']);
        
        if (!callback) {
            callback    = options;
            options     = {};
        } else {
            type        = options.type;
            stopOnError = options.stopOnError;
        }
        
        emitter.on('file', function(file, stat) {
            total      += stat.size || 0;
        });
        
        emitter.on('error', function(error) {
            callback(error);
        });
        
        emitter.on('end', function() {
            var result;
            
            if (type !== 'raw')
                result  = format.size(total);
            else
                result  = total;
            
            callback(null, result);
        });
        
        processDir(dir, options, emitter);
    };
   
    function processDir(dir, options, emitter) {
        var stopOnError     = options.stopOnError,
            wasError        = false,
            asyncRunning    = 0,
            fileCounter     = 1,
            
            execCallBack    = function () {
                var noErrors    = !wasError || !stopOnError,
                    yesAllDone   = !fileCounter && !asyncRunning;
                
                if (yesAllDone && noErrors)
                    emitter.emit('end');
            },
            
            getDirInfo      = function(dir) {
               stat(dir, Util.exec.with(getStat, dir));
            };
        
        getDirInfo(dir);
        
        function getStat(dir, error, stat) {
            var isDir;
            
            --fileCounter;
            
            if (!wasError || !stopOnError) {
                if (error && stopOnError) {
                    wasError    = true;
                    emitter.emmit('error', error);
                } else if (!error) {
                    isDir   = stat.isDirectory();
                    
                    if (!isDir)
                        emitter.emit('file', dir, stat);
                    else if (isDir) {
                        ++asyncRunning;
                        
                        fs.readdir(dir, function(error, files) {
                            if (error && stopOnError) {
                                wasError = true;
                                emitter.emit('error', error);
                            } else {
                                onReaddir(dir, files);
                            }
                        });
                    }
                }
                
                execCallBack();
            }
        }
        
        function onReaddir(dir, files) {
            var n   = files.length;
            
            asyncRunning--;
            
            fileCounter += n;
            
            if (!n)
                execCallBack();
            else
                files.forEach(function(file) {
                    var dirPath     = path.join(dir, file);
                    
                    process.nextTick(function() {
                        getDirInfo(dirPath);
                    });
                });
        }
    }
    
})();
