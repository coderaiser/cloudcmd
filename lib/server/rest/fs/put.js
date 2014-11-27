(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        Util        = require(DIR + 'util'),
        
        packer      = require(DIR_SERVER + 'packer'),
        
        tryRequire  = require(DIR_SERVER + 'tryRequire'),
        tryOptions  = {log: true, exit: true},
        
        flop        = tryRequire('flop', tryOptions),
        files       = tryRequire('files-io', tryOptions);
        
    module.exports  = function(query, name, readStream, callback) {
        var baseName    = path.basename(name),
            onDone      = function(msg, error) {
                if (!error)
                    msg     = CloudFunc.formatMsg(msg, baseName);
                
                callback(error, msg); 
            },
            onSave      = Util.exec.with(onDone, 'save'),
            OnMakeDir   = Util.exec.with(onDone, 'make dir');
        
        Util.check(arguments, ['query', 'name', 'readStream', 'callback']);
        
        switch(query) {
        default:
            files.pipe(readStream, name, onSave);
            break;
        
        case 'dir':
            flop.create(name, 'dir', OnMakeDir);
            break;
        
        case 'unzip':
            packer.unpack(readStream, name, onSave);
            break;
        }
    };
})();
