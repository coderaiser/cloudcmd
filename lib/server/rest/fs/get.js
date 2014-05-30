(function() {
    'use strict';
    
    var path            = require('path'),
        DIR             = path.resolve(__dirname + '/../../../') + '/',
        DIR_SERVER      = DIR + 'server/',
        Hash            = require(DIR_SERVER + 'hash'),
        dir             = require(DIR_SERVER + 'dir'),
        time            = require(DIR_SERVER + 'time'),
        pipe            = require(DIR_SERVER + 'pipe'),
        commander       = require(DIR_SERVER + 'commander'),
        CloudFunc       = require(DIR + 'cloudfunc'),
        Util            = require(DIR + 'util');
    
    exports.onGet = onGet;
    
    function onGet(query, name, callback) {
        var error, hash,
            func    = Util.exec.ret(callback);
        
        switch (query) {
        case 'size':
            dir.getSize(name, function(error, size) {
                if (!error)
                    size = CloudFunc.getShortSize(size);
                
                func(error, size);
            });
            break;
            
        case 'time':
            time.get(name, function(error, time) {
                var timeStr;
                
                if (!error)
                    timeStr = time.toString();
                
                func(error, timeStr);
            });
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'not suported, try update node';
                error   = CloudFunc.formatMsg('hash', error, 'error');
                func(error);
            } else
                pipe.create(name, hash, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hash.get();
                    
                    func(error, hex);
                });
            break;
        
        default:
            dir.isDir(name, function(error, isDir) {
                var getDirContent   = commander.getDirContent;
                
                if (isDir && !error)
                    getDirContent(name, func);
                else
                    func(error, null, !isDir);
            });
            break;
        }
    }
})();
