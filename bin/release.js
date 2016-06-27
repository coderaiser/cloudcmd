#!/usr/bin/env node

(function() {
    'use strict';
    
    var DIR         = '../',
        Info        = require(DIR + 'package'),
        
        minor       = require('minor'),
        place       = require('place'),
        rendy       = require('rendy'),
        shortdate   = require('shortdate'),
        
        ERROR   = Error('ERROR: version is missing. release --patch|--minor|--major');
    
    main(function(error) {
        if (error)
            console.error(error.message);
    });
    
    function main(callback) {
        var history     = 'Version history\n---------------\n',
            link        = '//github.com/coderaiser/cloudcmd/releases/tag/',
            template    = '- *{{ date }}*, '    +
                          '**[v{{ version }}]'   +
                          '(' + link + 'v{{ version }})**\n',
            version     = Info.version;
        
        cl(function(error, versionNew) {
            if (error) {
                callback(error);
            } else {
                replaceVersion('README.md', version, versionNew, callback);
                replaceVersion('HELP.md', version, versionNew, function() {
                    var historyNew = history + rendy(template, {
                        date    : shortdate(),
                        version : versionNew
                    });
                    
                    replaceVersion('HELP.md', history, historyNew, callback);
                });
            }
        });
    }
    
    function replaceVersion(name, version, versionNew, callback) {
        place(name, version, versionNew, function(error) {
            var msg;
            
            if (!error)
                msg = 'done: ' + name;
            
            callback(error, msg);
        });
    }
    
    function cl(callback) {
        var versionNew, error,
            argv        = process.argv,
            length      = argv.length - 1,
            last        = process.argv[length],
            regExp      = /^--(major|minor|patch)$/,
            match       = last.match(regExp);
        
        if (!regExp.test(last))
            error = ERROR;
        else if (match[1])
            versionNew  = minor(match[1], Info.version);
        else
            versionNew  = last.substr(3);
        
        callback(error, versionNew);
    }
})();

