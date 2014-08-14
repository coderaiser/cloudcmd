#!/usr/bin/env node

(function(){
    'use strict';
    
    var Info        = require('../package'),
        
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        
        Util        = require(DIR_LIB + 'util'),
        
        config      = {},
        
        argv        = process.argv,
        argvLength  = argv.length,
        argvLast    = argv.slice().pop();
    
    switch (argvLast) {
    default:
        if (argvLength > 2)
            if (isPort(argv)) {
                if (argvLast - 0 > 0)
                    config.port = argvLast;
                else
                    console.log('Error: port should be a number.');
            }
        else
            help();
        
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
    
    case '-h':
        help();
        break;
    
    case '--help':
        help();
        break;
    
    case '--repl':
        repl();
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
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: cloudcmd [OPTION]...',
            description = Info.description + '.',
            
            site        = Util.render('General help using Cloud Commander: <{{ url }}>', {
                url: Info.homepage
            });
        
        console.log(usage);
        console.log(description + '\n');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
        
        console.log('\n' + site);
    }
    
    function repl() {
        console.log('REPL mode enabled (telnet localhost 1337)');
        require(DIR_LIB + '/server/repl');
        start();
    }
    
})();
