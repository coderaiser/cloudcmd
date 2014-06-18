(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        flop            = require(DIR_SERVER + 'flop'),
        CloudFunc       = require(DIR + 'cloudfunc'),
        Util            = require(DIR + 'util');
    
    exports.onGet = onGet;
    
    function onGet(query, name, callback) {
        var func    = Util.exec.ret(callback);
        
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
            flop.read(name, 'hash', func);
            break;
        
        default:
            flop.read(name, func);
            break;
        }
    }
})();
