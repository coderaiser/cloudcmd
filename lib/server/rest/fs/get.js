(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        Hash            = main.hash,
        dir             = main.dir,
        time            = main.time,
        pipe            = main.pipe,
        CloudFunc       = main.cloudfunc,
        Util            = main.util;
    
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
                pipe.create({
                    from        : name,
                    write       : hash,
                    callback    : function (error) {
                        var hex;
                        
                        if (!error)
                            hex = hash.get();
                        
                        func(error, hex);
                    }
                });
            break;
        
        default:
            dir.isDir(name, function(error, isDir) {
                var getDirContent   = main.commander.getDirContent;
                
                if (isDir && !error)
                    getDirContent(name, func);
                else
                    func(error, null, !isDir);
            });
            break;
        }
    }
})();
