(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        fs          = require('fs'),
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        Util        = require(DIR + 'util'),
        
        flop        = require(DIR_SERVER + 'flop'),
        pack        = require(DIR_SERVER + 'pack'),
        pipe        = require(DIR_SERVER + 'pipe'),
        
        diffPatch   = require(DIR + 'diff/diff-match-patch').diff_match_patch,
        diff        = new (require(DIR + 'diff').DiffProto)(diffPatch);
        
    module.exports  = function(query, name, readStream, callback) {
        var baseName    = path.basename(name),
            onDone      = function(msg, error) {
                if (!error)
                    msg     = CloudFunc.formatMsg(msg, baseName);
                
                callback(error, msg); 
            },
            onSave      = Util.exec.with(onDone, 'save'),
            OnMakeDir   = Util.exec.with(onDone, 'make dir');
        
        Util.checkArgs(arguments, ['query', 'name', 'reqdStream', 'callback']);
        
        switch(query) {
        default:
            pipe.create(readStream, name, onSave);
            break;
        
        case 'dir':
            flop.create(name, 'dir', OnMakeDir);
            break;
        
        case 'file':
            fs.writeFile(name, '', callback);
            break;
        
        case 'unzip':
            pack.gunzip(readStream, name, onSave);
            break;
        
        case 'patch':
            flop.read(name, 'size raw', function(error, size) {
                var MAX_SIZE = CloudFunc.MAX_FILE_SIZE;
                
                if (!error)
                    if (size < MAX_SIZE)
                        pipe.getBody(readStream, function(error, patch) {
                            if (error)
                                callback(error);
                            else
                                patchFile(name, patch, callback);
                        });
                    else
                        error = 'File is to big. '          +
                                'Could not patch files '    +
                                'bigger then' + MAX_SIZE;
                
                if (error)
                    callback(error);
            });
            break;
        }
    };
    
    function patchFile(name, patch, callback) {
        var baseName        = path.basename(name),
            PATCH_FAIL      = CloudFunc.formatMsg('patch', baseName, 'fail');
        
        fs.readFile(name, 'utf8', read);
        
        function read(error, data) {
            var diffResult;
            
            if (error) {
                callback(error);
            } else {
                error         = Util.exec.tryLog(function() {
                    diffResult = diff.applyPatch(data, patch);
                });
                
                if (error || !diffResult)
                    callback(PATCH_FAIL);
                else
                    fs.writeFile(name, diffResult, onWrite);
            }
        }
        
        function onWrite(error) {
            var msg,
                baseName = path.basename(name);
            
            if (!error)
                msg = CloudFunc.formatMsg('patch', baseName);
            
            callback(error, msg);
        }
    }
})();
