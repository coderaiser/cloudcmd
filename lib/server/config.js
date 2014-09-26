(function() {
    'use strict';
    
    var DIR_SERVER  = __dirname     + '/',
        DIR_LIB     = DIR_SERVER    + '../',
        DIR         = DIR_SERVER    + '../../',
        
        fs          = require('fs'),
        
        Util        = require(DIR_LIB       + 'util'),
        tryRequire  = require(DIR_SERVER    + 'tryRequire'),
        
        ConfigPath  = DIR + 'json/config.json',
        
        config      = tryRequire(ConfigPath, {log: true}) || {};
    
    module.exports  = function(key, value) {
        var result;
        
        if (value === undefined)
            result      = config[key];
        else
            config[key] = value;
        
        return result;
    };
    
    module.exports.save = function(callback) {
        var data = Util.json.stringify(config);
        
        Util.checkArgs(arguments, ['callback']);
        
        if (data)
            fs.writeFile(ConfigPath, data, callback);
        else
            callback({
                message: 'Error: config is empty!'
            });
    };
    
})();
