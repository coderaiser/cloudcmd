(function() {
    'use strict';
    
    var main        = global.cloudcmd.main,
        Util        = main.util,
        pipe        = main.pipe,
        path        = require('path'),
        fs          = require('fs'),
        dir         = main.srvrequire('dir'),
        diff        = main.diff,
        CloudFunc   = main.cloudfunc,
        fse         =  {
            mkdirs  : main.require('mkdirp') || fs.mkdir.bind(fs),
        };
    
    exports.onPut = onPut;
    
    function onPut(name, query, readStream, callback) {
        var options,
            func        = Util.exec.ret(callback),
            baseName    = path.basename(name);
        
        switch(query) {
        case 'dir':
            fse.mkdirs(name, function(error) {
                var msg;
                
                if (!error)
                    msg = CloudFunc.formatMsg('make dir', name);
                
                func(error, msg);
            });
            break;
        
        default:
            options = {
                gunzip      : query === 'unzip'
            };
            
            pipe.create(readStream, name, options, function(error) {
                var msg;
                
                if (!error)
                    msg     = CloudFunc.formatMsg('save', baseName);
                
                func(error, msg);
            });
            break;
        
        case 'patch':
            dir.getSize(name, function(error, size) {
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
