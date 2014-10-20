#!/usr/bin/env node

(function(){
    'use strict';
    
    var Info        = require('../package'),
        
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        
        Util        = require(DIR_LIB + 'util'),
        port,
        argv        = process.argv,
        argvLength  = argv.length,
        argvLast    = argv.slice().pop();
    
    switch (argvLast) {
    default:
        port = argvLast - 0;
        
        if (argvLength === 2)
            start(true);
        else 
            if (!isPort(argv))
                help();
            else
                if (isNaN(port))
                    console.error('Error: port should be a number.');
                else
                    start(true, {
                        port: port
                    });
            
        break;
    
    case '--test':
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
        
        start();
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
    
    function start(isServer, config) {
        var SERVER      = '../lib/server',
            CLOUDCMD    = '..';
        
        if (isServer)
            require(SERVER)(config);
        else
            require(CLOUDCMD)(config);
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
        start(true);
    }
    
})();
