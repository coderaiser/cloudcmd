#!/usr/bin/env node

(function() {
    'use strict';
    
    var Info        = require('../package'),
         
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        DIR_SERVER  = DIR_LIB + 'server/',
        
        config      = require(DIR_SERVER + 'config'),
        rendy       = require('rendy'),
        createPass  = require(DIR_SERVER + 'password'),
        
        HOME_PAGE   = 'General help using Cloud Commander: <{{ url }}>',
        
        argv        = process.argv,
        args        = require('minimist')(argv.slice(2), {
            string: [
                'port',
                'password',
                'username',
                'online',
                'offline',
            ],
            boolean: [
                'auth',
                'server',
                'repl',
                'save'
            ],
            default: {
                server      : true,
                auth        : config('auth'),
                port        : config('port'),
                online      : config('online'),
                username    : config('username'),
            },
            alias: {
                v: 'version',
                h: 'help',
                p: 'password',
                on: 'online',
                u: 'username',
                s: 'save',
                a: 'auth'
            }
        });
    
    if (args.version) {
        version();
    } else if (args.help) {
        help();
    } else {
        if (args.repl)
            repl();
        
        port(args.port);
        password(args.password);
        
        config('auth', args.auth);
        config('online', args.online);
        config('username', args.username);
        
        if (args.save)
            config.save(start);
        else
            start();
    }
    
    function version() {
        console.log('v' + Info.version);
    }
    
    function start(config) {
        var SERVER = '../lib/server';
        
        if (args.server)
            require(SERVER)(config);
    }
    
    function password(pass) {
        var algo, hash;
        
        if (pass) {
            algo    = config('algo');
            hash    = createPass(algo, pass);
            
            config('password', hash);
        }
    }
    
    function port(arg) {
        var number = parseInt(arg, 10);
        
        if (!isNaN(number))
            config('port', number);
        else
            console.error('port: ignored, should be a number');
    }
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: cloudcmd [options]',
            
            site        = rendy(HOME_PAGE, {
                url: Info.homepage
            });
        
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            var line = '  ' + name + ' ' + bin[name];
            console.log(line);
        });
        
        console.log('\n' + site);
    }
    
    function repl() {
        console.log('REPL mode enabled (telnet localhost 1337)');
        require(DIR_LIB + '/server/repl');
    }
    
})();
