(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        fs          = require('fs'),
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        Util        = require(DIR + 'util'),
        
        flop        = require(DIR_SERVER + 'flop'),
        packer      = require(DIR_SERVER + 'packer'),
        pipe        = require(DIR_SERVER + 'pipe'),
        patch       = require('./patch');
        
    module.exports  = function(query, name, readStream, callback) {
        var baseName    = path.basename(name),
            onDone      = function(msg, error) {
                if (!error)
                    msg     = CloudFunc.formatMsg(msg, baseName);
                
                callback(error, msg); 
            },
            onSave      = Util.exec.with(onDone, 'save'),
            OnMakeDir   = Util.exec.with(onDone, 'make dir');
        
        Util.checkArgs(arguments, ['query', 'name', 'readStream', 'callback']);
        
        switch(query) {
        default:
            pipe(readStream, name, onSave);
            break;
        
        case 'dir':
            flop.create(name, 'dir', OnMakeDir);
            break;
        
        case 'file':
            fs.writeFile(name, '', callback);
            break;
        
        case 'unzip':
            packer.unpack(readStream, name, onSave);
            break;
        
        case 'patch':
            patch(name, readStream, function(error, msg) {
                var deprecated = '[Deprecated. Clear cache to use new API]';
                
                if (!error)
                    msg = deprecated + msg;
                    
                callback(error, msg);
            });
            break;
        }
    };
})();
