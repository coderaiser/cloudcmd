(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        pipe            = require(DIR_SERVER + 'pipe'),
        flop            = require(DIR_SERVER + 'flop'),
        Hash            = require(DIR_SERVER + 'hash'),
        mellow          = require(DIR_SERVER + 'mellow'),
        Util            = require(DIR + 'util');
    
    exports.onGet = onGet;
    
    function onGet(query, name, callback) {
        var hash, error,
            func    = Util.exec.ret(callback);
        
        switch (query) {
        default:
            mellow.read(name, func);
            break;
        
        case 'size':
            flop.read(name, 'size', func);
            break;
            
        case 'time':
            flop.read(name, 'time', func);
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'hash: not suported, try update node';
                func(new Error(error));
            } else
                pipe.create(name, hash, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hash.get();
                    
                    func(error, hex);
                });
            
            break;
        }
    }
})();
