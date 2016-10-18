(function() {
    'use strict';
    
    var DIR         = './',
        exit        = require(DIR + 'exit');
    
    module.exports.root     = root;
    module.exports.editor   = editor;
    
    function root(dir) {
        var fs;
        
        if (dir !== '/') {
            fs  = require('fs');
            fs.stat(dir, function(error) {
                if (error)
                    exit('cloudcmd --root: %s', error.message);
                else
                    console.log('root:', dir);
            });
        }
    }
    
    function editor(name) {
        var reg = /^(dword|edward|deepword)$/;
        
        if (!reg.test(name))
            exit('cloudcmd --editor: could be "dword", "edward" or "deepword" only');
    }
    
})();
