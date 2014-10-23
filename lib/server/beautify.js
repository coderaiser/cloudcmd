(function() {
    'use strict';
    
    var fs              = require('fs'),
        path            = require('path'),
        
        Util            = require('../util'),
        tryRequire      = require('./tryRequire'),
        beautify        = tryRequire('js-beautify');
    
    module.exports  = function(name, callback) {
        var EXT     = ['js', 'css', 'html'],
            ext     = path
                .extname(name)
                .slice(1),
            
            is      = ~EXT.indexOf(ext);
            
        if (!beautify)
            callback(Error('Beautify not installed'));
        else if (!is)
            callback(Error('File should be: ' + EXT));
        else
            fs.readFile(name, 'utf8', function(error, data) {
                var result;
                
                if (!error)
                    error = Util.exec.try(function() {
                        result = beautify[ext](data);
                    });
                    
                
                callback(error, result);
            });
    };
    
})();
