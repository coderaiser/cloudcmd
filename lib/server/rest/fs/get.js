(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        pipe            = require(DIR_SERVER + 'pipe'),
        flop            = require(DIR_SERVER + 'flop'),
        Hash            = require(DIR_SERVER + 'hash'),
        CloudFunc       = require(DIR + 'cloudfunc'),
        Util            = require(DIR + 'util');
    
    exports.onGet = onGet;
    
    function onGet(query, name, callback) {
        var hash, error,
            func    = Util.exec.ret(callback);
        
        switch (query) {
        case 'size':
            flop.read(name, 'size', function(error, size) {
                if (!error)
                    size = CloudFunc.getShortSize(size);
                
                func(error, size);
            });
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
                    
                    console.log(hex);
                    
                    func(error, hex);
                });
            
            break;
        
        default:
            flop.read(name, func);
            break;
        }
    }
})();
