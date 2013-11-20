(function (object) {
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# dir.js'                                          + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for getting file change time.'              + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = require('fs'),
        Util        = main.util;
    
    object.get   = function(filename, callback) {
        fs.stat(filename, function(error, stat) {
            var time;
            
            if (!error)
                time = stat.mtime.getTime();
            
            Util.exec(callback, error, time);
        });
    };
    
})(this);
