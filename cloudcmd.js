(function() {
    'use strict';
    
    var DIR         = __dirname + '/',
        DIR_LIB     = DIR       + 'lib/',
        DIR_SERVER  = DIR       + 'lib/server/',
        
        fs          = require('fs'),
        
        win         = require(DIR_SERVER + 'win'),
        main        = require(DIR_SERVER + 'main'),
        update      = require(DIR_SERVER + 'update'),
        tryRequire  = require(DIR_SERVER + 'tryRequire'),
        
        Util        = require(DIR_LIB + 'util'),
        server      = require(DIR_LIB + 'server'),
        
        Config      = main.config;
        
    exports.start = function(params) {
        readConfig(function(error, config) {
            var keys;
            
            if (error)
                Util.log(error.message);
            
            if (!config)
                config = {};
            
            if (params) {
                keys = Object.keys(params);
                
                keys.forEach(function(item) {
                    config[item] = params[item];
                });
            }
            
            init(config);
        });
        
        win.prepareCodePage();
    };
    
    function init(config) {
        Util.log('server dir: ' + DIR);
        
        if (update)
            update.get();
        
        if (config) {
            main.config = Config = config;
            
            if (config.test)
                Config.server  = false;
        }
        
        if (Config.logs) {
            Util.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            
            writeLogsToFile();
        }
        
        server.start();
    }
    
    function readConfig(callback) {
        var error,
            configPath  = DIR + 'json/config.json',
            config      = tryRequire(configPath, function(err) {
                if (err)
                    error = err;
            });
        
        Util.checkArgs(arguments, ['callback']);
        
        callback(error, config);
    }
    
    /* function sets stdout to file log.txt */
    function writeLogsToFile() {
        var stdout      = process.stdout,
            writeFile   = fs.createWriteStream('log.txt'),
            write       = writeFile.write.bind(writeFile);
        
        stdout.write    = write;
    }
})();
