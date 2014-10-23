(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        pipe            = require(DIR_SERVER + 'pipe'),
        flop            = require(DIR_SERVER + 'flop'),
        Hash            = require(DIR_SERVER + 'hash'),
        mellow          = require(DIR_SERVER + 'mellow'),
        beautify        = require(DIR_SERVER + 'beautify'),
        Util            = require(DIR + 'util');
    
    module.exports      = function(query, name, callback) {
        var hash, error;
        
        Util.checkArgs(arguments, ['query', 'name', 'callback']);
        
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
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'hash: not suported, try update node';
                callback(Error(error));
            } else
                pipe.create(name, hash, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hash.get();
                    
                    callback(error, hex);
                });
            
            break;
        }
    };
})();
