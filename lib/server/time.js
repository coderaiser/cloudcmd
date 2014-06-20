(function (object) {
    'use strict';
    
    /*
    '# time.js'                                         + '\n'  +
    '# -----------'                                     + '\n'  +
    '# Module is part of Cloud Commander,'              + '\n'  +
    '# used for getting file change time.'              + '\n'  +
    '# http://cloudcmd.io'                              + '\n';
    */
    
    var fs          = require('fs'),
        Util        = require('../util');
    
    object.get      = function(filename, option, callback) {
        var isRaw = option === 'raw';
        
        if (!callback)
            callback = option;
        
        Util.checkArgs(arguments, ['filename', 'callback']);
        
        fs.stat(filename, function(error, stat) {
            var time, timeRet;
            
            if (!error) {
                time = stat.mtime;
                
                if (isRaw)
                    timeRet = time.getTime();
                else
                    timeRet = time;
            }
            
            callback(error, timeRet);
        });
    };
    
})(this);
