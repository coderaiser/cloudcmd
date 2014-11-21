(function() {
    'use strict';
    
    var DIR         = '../../../',
        DIR_SERVER  = DIR + 'server/',
        
        path        = require('path'),
        
        CloudFunc   = require(DIR + 'cloudfunc'),
        Util        = require(DIR + 'util'),
        
        patch       = require(DIR_SERVER + 'patch'),
        tryRequire  = require(DIR_SERVER + 'tryRequire'),
        
        pipe        = tryRequire('pipe-io', {log: true, exit: true});
        
    module.exports  = function(name, readStream, callback) {
        var baseName    = path.basename(name);
            
        Util.check(arguments, ['name', 'readStream', 'callback']);
        
        pipe.getBody(readStream, function(error, data) {
            var options = {
                size: CloudFunc.MAX_FILE_SIZE
            };
            
            patch(name, data, options, function(error) {
                var msg;
                
                if (!error)
                    msg = CloudFunc.formatMsg('patch', baseName);
                
                callback(error, msg);
            });
        });
    };
})();
