#!/usr/bin/env node

(function() {
    'use strict';
    
    var config,
        Info        = require('../package'),
        
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        DIR_SERVER  = DIR_LIB + 'server/',
        
        rendy       = require('rendy'),
        createPass  = require(DIR_SERVER + 'password'),
        
        HOME_PAGE   = 'General help using Cloud Commander: <{{ url }}>',
        
        argv        = process.argv,
        args        = require('minimist')(argv.slice(2), {
            string: ['port', 'password', 'username', 'auth', 'no-auth'],
            boolean: ['test', 'repl', 'save'],
            alias: {
                v: 'version',
                h: 'help',
                p: 'port',
                u: 'username',
                ps: 'password',
                s: 'save',
                a: 'auth',
                na: 'no-auth',
            }
        });
    
    if (args.version) {
        version();
    } else if (args.help) {
        help();
    } else if (args.test) {
        test();
    } else {
        if (args.repl)
            repl();
        
        config  = require(DIR_SERVER + 'config');
        
        password(args.password);
        username(args.username);
        port(args.port);
        
        if (args.auth)
            config('auth', true);
        else if (args['no-auth'])
            config('auth', false);
        
        if (args.save)
            config.save(start);
        else
            start();
    }
    
    function test() {
        console.log('Cloud Commander testing mode');
        console.log('argv: ', argv);
        
        require('..');
    }
    
    function version() {
        console.log('v' + Info.version);
    }
    
    function start(config) {
        var SERVER      = '../lib/server';
        
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
    
    function username(name) {
        if (name)
            config('username', name);
    }
    
    function port(number) {
        if (number) {
            if (!isNaN(number))
                config('port', number);
            else
                console.error('port: ignored, should be a number');
        }
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
