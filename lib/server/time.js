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
    
    object.get      = function(filename, options, callback) {
        var noOptions = Util.isFunction(options);
        
        if (!callback && noOptions)
            callback = options;
        
        fs.stat(filename, function(error, stat) {
            var time, timeRet;
            
            if (!error) {
                time = stat.mtime;
                
                if (options && options.str)
                    timeRet = time;
                else
                    timeRet = time.getTime();
            }
            
            Util.exec(callback, error, timeRet);
        });
    };
    
})(this);
