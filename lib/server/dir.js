/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    /*
    * dir.js'                    
    * -----------'               
    * used for getting dir size.'
    * dir.getSize(path, callback)
    */
    
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
    
    exports.isDir   = function(name, callback) {
        name += '';
        
        stat(name, function(error, stat) {
            var isDir;
            
            if (!error)
                isDir = stat.isDirectory();
            
            Util.exec(callback, error, isDir);
        });
    };
    
    exports.getSize = function(dir, type, callback) {
        var total          = 0;
        
        Util.checkArgs(arguments, ['dir', 'callback']);
        
        if (!callback)
            callback = type;
        
        function calcSize(stat) {
            var size   = stat && stat.size || 0;
            
            total      += size;
        }
        
        processDir(dir, calcSize, function() {
            var result;
            
            if (type !== 'raw')
                result  = format.size(total);
            else
                result  = total;
            
            Util.exec(callback, null, result);
        });
    };
   
    function processDir(dir, func, callback) {
        var asyncRunning   = 0,
            fileCounter    = 1;
        
        function getDirInfo(dir) {
            stat(dir, Util.exec.with(getStat, dir));
        }
        
        function getStat(dir, error, stat) {
            --fileCounter;
            
            if (!error)
                if (stat.isFile())
                    Util.exec(func, stat);
                else if (stat.isDirectory()) {
                    ++asyncRunning;
                    
                    fs.readdir(dir, function(error, files) {
                        var dirPath, file, n, i;
                        
                        asyncRunning--;
                        
                        if (!error) {
                            n               = files.length;
                            fileCounter    += n;
                            
                            for (i = 0; i < n; i++) {
                                file        = files[i];
                                dirPath     = path.join(dir, file);
                                
                                process.nextTick(getDirInfo.bind(null, dirPath));
                            }
                        }
                        
                        if (!n)
                            execCallBack();
                    });
                }
            
            execCallBack();
        }
        
        function execCallBack() {
            if (!fileCounter && !asyncRunning)
                Util.exec(callback);
        }
        
        getDirInfo(dir);
   }
   
   /** Функция получает короткие размеры
     * конвертируя байт в килобайты, мегабойты,
     * гигайбайты и терабайты
     * @pSize - размер в байтах
     */
    exports.getShortSize    = function(size) {
        var isNumber    = Util.isNumber(size),
            l1KB        = 1024,
            l1MB        = l1KB * l1KB,
            l1GB        = l1MB * l1KB,
            l1TB        = l1GB * l1KB,
            l1PB        = l1TB * l1KB;
        
        if (isNumber) {
            if      (size < l1KB)   size = size + 'b';
            else if (size < l1MB)   size = (size/l1KB).toFixed(2) + 'kb';
            else if (size < l1GB)   size = (size/l1MB).toFixed(2) + 'mb';
            else if (size < l1TB)   size = (size/l1GB).toFixed(2) + 'gb';
            else if (size < l1PB)   size = (size/l1TB).toFixed(2) + 'tb';
            else                    size = (size/l1PB).toFixed(2) + 'pb';
        }
        
        return size;
    };
        
})();
