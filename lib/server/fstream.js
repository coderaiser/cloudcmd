(function () {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# fstream.js'                                     + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with files.'                      + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        Util        = main.util,
        fstream     = main.require('fstream'),
        tar         = main.require('tar');
    
    
    exports.pack    = packDir;
    
    function packDir(path, stream) {
        var dirStream, tarStream, ret;
        
        if (tar && fstream) {
            dirStream   = fstream.Reader({
                type: "Directory",
                path: path
            });
                
            tarStream   = tar.Pack({});
            
            ret = dirStream.pipe(tarStream);
        }
        
        return ret;
    }
    
})();
