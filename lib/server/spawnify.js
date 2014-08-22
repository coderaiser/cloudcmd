(function() {
    'use strict';
    
    var child_process   = require('child_process'),
        spawn           = child_process.spawn,
        
        DIR             = '../',
        
        Util            = require(DIR + 'util');
    
    module.exports = function(сommand, options, callback) {
        var cmd, error,
            isSended    = false,
            args        = сommand.split(' '),
            func        = function(error, stdout, stderr) {
                isSended = true;
                callback(error, stdout, stderr);
            };
        
        сommand    = args.shift();
        
        error       = Util.exec.tryLog(function() {
            cmd = spawn(сommand, args, options);
        });
        
        if (error) {
            callback(error);
        } else {
            cmd.stderr.setEncoding('utf8');
            cmd.stdout.setEncoding('utf8');
            
            cmd.stdout.on('data', function(data) {
                func(null, data);
            });
            
            cmd.stderr.on('data', function(error) {
                func(null, null, error);
            });
            
            cmd.on('error', function(error) {
                func(error);
            });
            
            cmd.on('close', function() {
                cmd = null;
                
                if (!isSended)
                    func();
            });
        }
    };
})();
