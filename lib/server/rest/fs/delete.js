(function(){
    'use strict';
    
    var main        = global.cloudcmd.main,
        fs          = require('fs'),
        Util        = main.util,
        fse         = main.require('fs-extra') || {
            remove  : fs.rmdir.bind(fs),
        };
    
    exports.onDelete = onDelete;
    
    function onDelete(name, files, query, callback) {
        var i, n, onStat, isDirFunc,
            assync  = 0,
            rmFile  = fs.unlink.bind(fs),
            rmDir   = fse.remove.bind(fse),
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
            dir     = name;
            
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
                name        = dir + files[i];
                isDirFunc   = Util.bind(onIsDir, name);
                
                dir.isDir(name, isDirFunc);
                Util.log(name);
            }
            break;
        }
    }
})();
