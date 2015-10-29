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
    
    options,
    argv        = process.argv,
    
    args        = require('minimist')(argv.slice(2), {
        string: [
            'port',
            'password',
            'username',
            'config',
            'editor',
            'root',
            'prefix'
        ],
        boolean: [
            'auth',
            'repl',
            'save',
            'server',
            'online',
            'minify',
            'progress',
            'progress-of-copying',
            'html-dialogs'
        ],
        default: {
            server      : true,
            auth        : config('auth'),
            port        : config('port'),
            minify      : config('minify'),
            online      : config('online'),
            editor      : config('editor') || 'edward',
            username    : config('username'),
            root        : config('root') || '/',
            prefix      : config('prefix') || '',
            progress    : config('progress') || config('progressOfCopying'),
            
            'html-dialogs' : config('htmlDialogs')
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
        
        checkUpdate();
        
        port(args.port);
        
        config('auth', args.auth);
        config('online', args.online);
        config('minify', args.minify);
        config('username', args.username);
        config('progress', args.progress);
        config('prefix', args.prefix);
        config('root', args.root);
        config('htmlDialogs', args['html-dialogs']);
        
        deprecate('progress-of-copying', 'progress');
        
        readConfig(args.config);
        
        options = {
            root: args.root,
            editor: args.editor,
            prefix: args.prefix
        };
        
        if (args.password)
            config('password', getPassword(args.password));
        
        if (!args.save)
            start(options);
        else
            config.save(function() {
                start(options);
            });
    }
    
    function getPassword(password) {
        return createPass(config('algo'), password);
    }
    
    function deprecate(was, became) {
        var value = args[was];
        
        if (value) {
            console.log('cloudcmd --' + was + ': deprecated, use --' + became);
            config(became, value);
        }
    }
    
    function version() {
        console.log('v' + Info.version);
    }
    
    function start(config) {
        var SERVER = '../lib/server';
        
        if (args.server)
            require(SERVER)(config);
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
    
    function repl() {
        console.log('REPL mode enabled (telnet localhost 1337)');
        require(DIR_LIB + '/server/repl');
    }
    
    function checkUpdate() {
        var load    = require('package-json'),
            chalk   = require('chalk'),
            rendy   = require('rendy');
        
        load(Info.name, 'latest').then(function(data) {
            var latest,
                current,
                version = data.version;
                
            if (version !== Info.version) {
                latest  = rendy('update available: {{ latest }}', {
                    latest: chalk.green.bold('v' + version),
                });
               
                current = chalk.dim(rendy('(current: v{{ current }})', {
                    current: Info.version
                }));
                
                console.log('%s %s', latest, current);
            }
        });
    }
    
})();
