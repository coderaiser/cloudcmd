(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_SERVER  = './',
        
        fs          = require('fs'),
        
        Util        = require(DIR + 'util'),
        
        diffPatch   = require(DIR + 'diff/diff-match-patch').diff_match_patch,
        diff        = new (require(DIR + 'diff').DiffProto)(diffPatch),
        
        flop        = require(DIR_SERVER + 'flop'),
        
        ERROR_MSG   = 'File is to big. '          +
                      'Could not patch files '    +
                      'bigger then ';
    
    module.exports = function(name, patch, options, callback) {
        Util.checkArgs(arguments, ['name', 'patch', 'callback']);
        
        if (!callback) {
            callback    = options;
            options     = {};
        }
        
        flop.read(name, 'size raw', function(error, size) {
            if (!error)
                if (isNaN(options.size) || size < options.size)
                    patchFile(name, patch, callback);
                else
                    error = {
                        message: ERROR_MSG + options.size
                    };
            
            if (error)
                callback(error);
        });
    };
    
    function patchFile(name, patch, callback) {
        fs.readFile(name, 'utf8', function read(error, data) {
            var diffResult;
            
            if (error) {
                callback(error);
            } else {
                error   = Util.exec.try(function() {
                    diffResult = diff.applyPatch(data, patch);
                });
                
                if (error)
                    callback(error);
                else
                    fs.writeFile(name, diffResult, callback);
            }
        });
    }
})();
