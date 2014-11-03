(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        files           = require(DIR_SERVER + 'files'),
        flop            = require(DIR_SERVER + 'flop'),
        hash            = require(DIR_SERVER + 'hash'),
        mellow          = require(DIR_SERVER + 'mellow'),
        beautify        = require(DIR_SERVER + 'beautify'),
        minify          = require(DIR_SERVER + 'minify'),
        Util            = require(DIR + 'util');
    
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
