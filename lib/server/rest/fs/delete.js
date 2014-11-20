(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        Util        = require(DIR        + 'util'),
        tryRequire  = require(DIR_SERVER + 'tryRequire'),
        flop        = tryRequire(DIR + 'flop', {log: true, exit: true});
    
    module.exports  = function(query, name, files, callback) {
        var func        = Util.exec.ret(callback),
            fileNames   = Util.slice(files);
        
        switch(query) {
        default:
            flop.delete(name, func);
            break;
            
        case 'files':
            deleteFiles(name, fileNames, func);
            break;
        }
    };
    
    function deleteFiles(from, names, callback) {
        var name,
            isLast = true;
        
        isLast  = !names.length;
        name    = names.shift();
        
        if (isLast)
            callback(null);
        else
            flop.delete(from + name, function(error) {
                if (error)
                    callback(error);
                else
                    deleteFiles(from, names, callback);
            });
    }
    
})();
