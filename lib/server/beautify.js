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
        
        EXT             = ['js', 'css', 'html'],
        ERROR_MSG       = 'File type "{{ ext }}" not supported.',
        ERROR_MSG_INST  = 'Beautify not installed',
        ConfigPath      = DIR   + 'json/beautify.json',
        ConfigHome      = HOME  + '.beautify.json',
        
        config          =
            tryRequire(ConfigHome) ||
            tryRequire(ConfigPath, {log: true}) || {};
    
    module.exports  = function(name, callback) {
        var ext     = path
                .extname(name)
                .slice(1),
            
            is      = ~EXT.indexOf(ext);
            
        if (!beautify)
            callback(Error(ERROR_MSG_INST));
        else if (!is)
            callback(Error(Util.render(ERROR_MSG, {
                ext : ext
            })));
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
