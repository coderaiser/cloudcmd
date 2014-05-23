(function(){
    'use strict';
    
    var main        = global.cloudcmd.main,
        fs          = require('fs'),
        dir         = main.dir,
        Util        = main.util,
        rimraf      = main.require('rimraf'),
        fse         = {
            delete  : rimraf || fs.rmdir,
        };
    
    exports.onDelete = onDelete;
    
    function onDelete(name, files, query, callback) {
        var func        = Util.exec.ret(callback),
            fileNames   = Util.slice(files),
            rmFile      = fs.unlink,
            rmDir       = fse.delete;
        
        switch(query) {
        default:
            rmFile(name, func);
            break;
        
        case 'dir':
            rmDir(name, func);
            break;
            
        case 'files':
            deleteFiles(name, fileNames, func);
            break;
        }
    }
    
    function deleteFiles(from, names, callback) {
        var name,
            rmFile  = fs.unlink,
            rmDir   = fse.delete,
            isLast = true;
        
        isLast  = !names.length;
        name    = names.shift();
        
        if (isLast)
            callback(null);
        else
            Util.exec.if(rimraf, function(result, func) {
                (func || rimraf)(from + name, function(error) {
                    if (error)
                        callback(error);
                    else
                        deleteFiles(from, names, callback);
                });
            }, function(func) {
                dir.isDir(name, function(error, isDir) {
                    var funcRm;
                    
                    if (error)
                        callback(error);
                    else if (isDir)
                        funcRm = rmDir;
                    else
                        funcRm = rmFile;
                    
                    func(null, funcRm);
                });
            });
    }
    
})();
