(function() {
    'use strict';
    
    var fs              = require('fs'),
        path            = require('path'),
        
        Util            = require('../util'),
        tryRequire      = require('./tryRequire'),
        beautify        = tryRequire('js-beautify'),
        
        DIR             = '../../',
        HOME_WIN        = process.env.HOMEPATH,
        HOME_UNIX       = process.env.HOME,
        HOME            = (HOME_UNIX || HOME_WIN) + '/',
        
        ConfigPath      = DIR   + 'json/beautify.json',
        ConfigHome      = HOME  + '.beautify.json',
        
        config          =
            tryRequire(ConfigHome) ||
            tryRequire(ConfigPath, {log: true}) || {};
    
    module.exports  = function(name, callback) {
        var EXT     = ['js', 'css', 'html'],
            ext     = path
                .extname(name)
                .slice(1),
            
            is      = ~EXT.indexOf(ext);
            
        if (!beautify)
            callback(Error('Beautify not installed'));
        else if (!is)
            callback(Error('Supported file types: ' + EXT.join(', ')));
        else
            fs.readFile(name, 'utf8', function(error, data) {
                var result;
                
                if (!error)
                    error = Util.exec.try(function() {
                        result = beautify[ext](data, config);
                    });
                    
                
                callback(error, result);
            });
    };
    
})();
