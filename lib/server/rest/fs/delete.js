(function(){
    'use strict';
    
    var main        = global.cloudcmd.main,
        fs          = require('fs'),
        dir         = main.dir,
        Util        = main.util,
        fse         = {
            remove  : main.require('rimraf') || fs.rmdir,
        };
    
    exports.onDelete = onDelete;
    
    function onDelete(name, files, query, callback) {
        var i, n, isDirFunc, onIsDir, dirPath,
            assync  = 0,
            rmFile  = fs.unlink,
            rmDir   = fse.remove,
            func    = Util.retExec(callback);
        
        switch(query) {
        default:
            rmFile(name, func);
            break;
        
        case 'dir':
            rmDir(name, func);
            break;
        
        case 'files':
            n       = files && files.length,
            dirPath = name,
            
            onIsDir  = function(name, error, isDir) {
                var log     = Util.log.bind(Util);
                ++assync;
                
                if (error)
                    func(error);
                else {
                    if (isDir)
                        rmDir(name, log);
                    else
                        rmFile(name, log);
                    
                    if (assync === n)
                        func();
                }
            };
            
            for (i = 0; i < n; i ++) {
                name        = dirPath + files[i];
                isDirFunc   = Util.bind(onIsDir, name);
                
                dir.isDir(name, isDirFunc);
                Util.log(name);
            }
            break;
        }
    }
})();
