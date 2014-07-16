#!/usr/bin/env node

(function(){
    'use strict';
    
    var Info        = require('../package'),
        
        fs          = require('fs'),
        
        DIR         = '../lib/',
        
        Util        = require(DIR + 'util'),
        CloudFunc   = require(DIR + 'cloudfunc'),
        
        argv        = process.argv,
        length      = argv.length - 1,
        argvLast    = argv[length];
    
    switch (argvLast) {
    default:
        start();
        break;
    
    case '--test':
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
        
        start({
            test: true
        });
        break;
    
    case '-v':
        version();
        break;
    
    case '--version':
        version();
        break;
    }
    
    function version() {
        console.log('v' + Info.version);
    }
    
    function start(params) {
        var cloudcmd    = require('../cloudcmd');
        
        readConfig(function(config) {
            if (params && params.test)
                config.test = params.test;
            
            cloudcmd.start(config);
        });
    }
    
    function readConfig(callback) {
        var path = __dirname + '/../json/config.json';
        
        Util.checkArgs(arguments, ['callback']);
        
        fs.readFile(path, 'utf8', function(error, data) {
            var status, config, msg;
            
            if (error) {
                status  = 'error';
                Util.log(error.code);
            } else {
                status  = 'ok';
                config  = Util.parseJSON(data);
            }
            
            msg         = CloudFunc.formatMsg('read', 'config', status);
            
            Util.log(msg);
            
            callback(config);
        });
    }
    
})();
