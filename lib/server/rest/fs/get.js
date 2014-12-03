(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        
        Util            = require(DIR + 'util'),
        
        hash            = require(DIR_SERVER + 'hash'),
        beautify        = require(DIR_SERVER + 'beautify'),
        minify          = require('minify'),
        
        tryRequire      = require(DIR_SERVER + 'tryRequire'),
        tryOptions      = {log: true, exit: true},
        
        mellow          = tryRequire('mellow', tryOptions),
        flop            = tryRequire('flop', tryOptions),
        files           = tryRequire('files-io', tryOptions);
    
    module.exports      = function(query, name, callback) {
        var hashStream, error;
        
        Util.check(arguments, ['query', 'name', 'callback']);
        
        switch (query) {
        default:
            mellow.read(name, callback);
            break;
        
        case 'size':
            flop.read(name, 'size', callback);
            break;
            
        case 'time':
            flop.read(name, 'time', callback);
            break;
        
        case 'beautify':
            beautify(name, callback);
            break;
        
        case 'minify':
            minify(name, callback);
            break;
        
        case 'hash':
            hashStream = hash();
            
            if (!hashStream) {
                error   = 'hash: not suported, try update node';
                callback(Error(error));
            } else
                files.pipe(name, hashStream, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hashStream.get();
                    
                    callback(error, hex);
                });
            
            break;
        }
    };
})();
