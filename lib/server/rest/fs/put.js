(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        check       = require('check'),
        exec        = require('execon'),
        
        packer      = require(DIR_SERVER + 'packer'),
        
        tryRequire  = require(DIR_SERVER + 'tryRequire'),
        tryOptions  = {log: true, exit: true},
        
        flop        = tryRequire('flop', tryOptions),
        files       = tryRequire('files-io', tryOptions),
        
        onSave      = exec.with(onDone, 'save'),
        onMakeDir   = exec.with(onDone, 'make dir');
        
    module.exports  = function(query, name, readStream, callback) {
        var onFile  = exec.with(onSave, name, callback),
            onDir   = exec.with(onMakeDir, name, callback);
        
        check(arguments, ['query', 'name', 'readStream', 'callback']);
        
        switch(query) {
        default:
            files.pipe(readStream, name, onFile);
            break;
        
        case 'dir':
            flop.create(name, 'dir', onDir);
            break;
        
        case 'unzip':
            packer.unpack(readStream, name, onFile);
            break;
        }
    };
    
    function onDone(msg, name, callback, error) {
        var baseName    = path.basename(name);
        
        if (!error)
            msg     = CloudFunc.formatMsg(msg, baseName);
        
        callback(error, msg); 
    }
})();
