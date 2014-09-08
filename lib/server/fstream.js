(function () {
    'use strict';
    
    var DIR         = './',
        
        tryRequire  = require(DIR + 'tryRequire'),
        
        fstream     = tryRequire('fstream'),
        tar         = tryRequire('tar');
    
    exports.pack    = function (path) {
        var dirStream, tarStream;
        
        if (tar && fstream) {
            dirStream   = fstream.Reader({
                type: 'Directory',
                path: path
            });
                
            tarStream   = tar.Pack({});
            
            dirStream = dirStream.pipe(tarStream);
        }
        
        return dirStream;
    };
    
})();
