(function() {
    'use strict';
    
    var main        = global.cloudcmd.main,
        
        DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        fs          = require('fs'),
        diff        = main.diff,
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        Util        = require(DIR + 'util'),
        
        flop        = require(DIR_SERVER + 'flop'),
        pack        = require(DIR_SERVER + 'pack'),
        pipe        = require(DIR_SERVER + 'pipe');
        
    exports.onPut = onPut;
    
    function onPut(query, name, readStream, callback) {
        var func        = Util.exec.ret(callback),
            baseName    = path.basename(name),
            onDone      = function(msg, error) {
                if (!error)
                    msg     = CloudFunc.formatMsg(msg, baseName);
                
                func(error, msg); 
            },
            onSave      = Util.exec.with(onDone, 'save'),
            OnMakeDir   = Util.exec.with(onDone, 'make dir');
        
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
                                func(error);
                            else
                                patchFile(name, patch, func);
                        });
                    else
                        error = 'File is to big. '          +
                                'Could not patch files '    +
                                'bigger then' + MAX_SIZE;
                
                if (error)
                    func(error);
            });
            break;
        }
    }
    
    function patchFile(name, patch, func) {
        var msg,
            baseName = path.basename(name);
        
        fs.readFile(name, 'utf8', read);
        
        function read(error, data) {
            var diffResult;
            
            if (error)
                func(error);
            else {
                error         = Util.exec.tryLog(function() {
                    diffResult = diff.applyPatch(data, patch);
                });
                
                if (diffResult && !error)
                    fs.writeFile(name, diffResult, onWrite);
                else {
                    msg     = CloudFunc.formatMsg('patch', baseName, 'fail');
                    func(null, msg);
                }
            }
        }
        
        function onWrite(error) {
            var msg,
                baseName = path.basename(name);
            
            if (!error)
                msg = CloudFunc.formatMsg('patch', baseName);
            
            func(error, msg);
        }
    }
})();
