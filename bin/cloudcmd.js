#!/usr/bin/env node

(function() {
    'use strict';
    
    var Info        = require('../package'),
         
        DIR         = __dirname + '/../',
        DIR_LIB     = DIR + 'lib/',
        DIR_SERVER  = DIR_LIB + 'server/',
        
        exit        = require(DIR_SERVER + 'exit'),
        config      = require(DIR_SERVER + 'config'),
        createPass  = require(DIR_SERVER + 'password'),
        
        argv        = process.argv,
        
        args        = require('minimist')(argv.slice(2), {
            string: [
                'port',
                'password',
                'username',
                'config',
                'editor',
                'root'
            ],
            boolean: [
                'auth',
                'repl',
                'save',
                'server',
                'online',
                'minify'
            ],
            default: {
                server      : true,
                auth        : config('auth'),
                port        : config('port'),
                minify      : config('minify'),
                online      : config('online'),
                editor      : config('editor') || 'edward',
                username    : config('username'),
                root        : config('root') || '/'
            },
            alias: {
                v: 'version',
                h: 'help',
                p: 'password',
                o: 'online',
                u: 'username',
                s: 'save',
                a: 'auth',
                c: 'config'
            },
            unknown: function(cmd) {
                exit('\'%s\' is not a cloudcmd option. See \'cloudcmd --help\'.', cmd);
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
        config('minify', args.minify);
        config('username', args.username);
        root(args.root);
        editor(args.editor);
        
        readConfig(args.config);
        
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
            exit('cloudcmd --port: should be a number');
    }
    
    function readConfig(name) {
        var fs, data, error, tryCatch;
        
        if (name) {
            fs          = require('fs');
            tryCatch    = require('try-catch');
            error       = tryCatch(function() {
                var json    = fs.readFileSync(name);
                data        = JSON.parse(json);
            });
            
            if (error)
                exit(error.message);
            else
                Object.keys(data).forEach(function(item) {
                    config(item, data[item]);
                });
        }
    }
    
    function help() {
        var bin         = require('../json/bin'),
            usage       = 'Usage: cloudcmd [options]',
            url         = Info.homepage;
        
        console.log(usage);
        console.log('Options:');
        
        Object.keys(bin).forEach(function(name) {
            console.log('  %s %s', name, bin[name]);
        });
        
        console.log('\nGeneral help using Cloud Commander: <%s>', url);
    }
    
    function root(dir) {
        var fs;
        
        config('root', dir);
        
        if (dir !== '/') {
            fs  = require('fs');
            fs.stat(dir, function(error) {
                if (error)
                    exit('cloudcmd --root: %s', error.message);
                else
                    console.log('root:', dir);
            });
        }
    }
    
    function editor(name) {
        var reg = /^(dword|edward)$/;
        
        if (!reg.test(name))
            exit('cloudcmd --editor: could be "dword" or "edward" only');
    }
    
    function repl() {
        console.log('REPL mode enabled (telnet localhost 1337)');
        require(DIR_LIB + '/server/repl');
    }
    
})();
