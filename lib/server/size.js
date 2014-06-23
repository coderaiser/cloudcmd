/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    var fs          = require('fs'),
        path        = require('path'),
        
        DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        
        format      = require(DIR_SERVER + 'format'),
        Util        = require(DIR        + 'util'),
        
        /*  The lstat() function shall be equivalent to stat(),
            except when path refers to a symbolic link. In that case lstat()
            shall return information about the link, while stat() shall return
            information about the file the link references. 
        */
        stat    = fs.lstat;
    
    exports.get = function(dir, type, callback) {
        var total          = 0;
        
        Util.checkArgs(arguments, ['dir', 'callback']);
        
        if (!callback)
            callback = type;
        
        function calcSize(error, size) {
            if (!error)
                total      += size;
        }
        
        processDir(dir, calcSize, function(error) {
            var result;
            
            if (type !== 'raw')
                result  = format.size(total);
            else
                result  = total;
            
            Util.exec(callback, error, result);
        });
    };
   
    function processDir(dir, func, callback) {
        var asyncRunning    = 0,
            fileCounter     = 1,
            
            execCallBack    = function () {
                if (!fileCounter && !asyncRunning)
                    Util.exec(callback);
            },
            
            getDirInfo      = function(dir) {
               stat(dir, Util.exec.with(getStat, dir));
            };
            
        getDirInfo(dir);
        
        function getStat(dir, error, stat) {
            var isFile, isDir;
            
            --fileCounter;
            
            if (error) {
                callback(error);
            } else {
                isFile  = stat.isFile(),
                isDir   = stat.isDirectory();
                
                if (isFile)
                    func(null, stat.size);
                else if (isDir) {
                    ++asyncRunning;
                    
                    fs.readdir(dir, function(error, files) {
                        var getInfo, dirPath, file, n, i;
                        
                        asyncRunning--;
                        
                        if (!error) {
                            n               = files.length;
                            fileCounter    += n;
                            
                            for (i = 0; i < n; i++) {
                                file        = files[i];
                                dirPath     = path.join(dir, file);
                                getInfo     = Util.exec.with(getDirInfo, dirPath);
                                
                                process.nextTick(getInfo);
                            }
                        }
                        
                        if (!n)
                            execCallBack();
                    });
                }
            }
            
            execCallBack();
        }
    }
    
})();
