#!/usr/bin/env node

(function(){
    'use strict';
    
    var Info        = require('../package'),
        
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        
        Util        = require(DIR_LIB + 'util'),
        
        argv        = process.argv,
        args        = require('minimist')(argv.slice(2), {
            string: 'port',
            boolean: ['test', 'repl'],
            alias: { 
                v: 'version',
                h: 'help',
                p: 'port' }
        });
    
    if (args.version) {
        version();
    } else if (args.help) {
        help();
    } else if (args.test) {
        test();
    } else if (!args.repl && !args.port) {
        start();
    } else {
        if (args.repl)
            repl();
        
        if (!args.port)
            start();
        else
            if (isNaN(args.port))
                console.error('Error: port should be a number!');
            else
                start({
                    port: args.port
                });
            
    }
    
    function test() {
        Util.log('Cloud Commander testing mode');
        Util.log('argv: ', argv);
        
        require('..');
    }
    
    function version() {
        console.log('v' + Info.version);
    }
    
    function start(config) {
        var SERVER      = '../lib/server';
        
        require(SERVER)(config);
    }
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: cloudcmd [options]',
            
            site        = Util.render('General help using Cloud Commander: <{{ url }}>', {
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
