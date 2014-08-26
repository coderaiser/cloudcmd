(function () {
    'use strict';
    
    var DIR         = '../',
        Util        = require(DIR + 'util'),
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
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
    
})();
