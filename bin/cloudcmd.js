#!/usr/bin/env node

(function(){
    'use strict';
    
    var Info        = require('../package'),
        
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        
        Util        = require(DIR_LIB + 'util'),
        
        config      = {},
        
        argv        = process.argv,
        argvLast    = argv.slice().pop();
    
    switch (argvLast) {
    default:
        if (isPort(argv)) {
            if (argvLast - 0 > 0)
                config.port = argvLast;
            else
                console.log('Error: port should be a number.');
        }
        
        start(config);
        
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
        
        cloudcmd.start(params);
    }
    
    function isPort(argv) {
        var length  = argv.length,
            str     = argv
                .slice(length - 2, length - 1)
                .pop(),
            
            PORT    = ['-p', '--port'],
            is      = Util.strCmp(str, PORT);
        
        return is;
    }
    
})();
