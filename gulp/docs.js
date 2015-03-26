(function() {
    'use strict';
    
    var DIR         = '../',
        
        cl          = require('./cl'),
        place       = require('place'),
        rendy       = require('rendy'),
        shortdate   = require('shortdate'),
        Info        = require(DIR + 'package');
        
    module.exports = function(callback) {
        var history     = 'Version history\n---------------\n',
            link        = '//github.com/cloudcmd/archive/raw/master/cloudcmd',
            template    = '- *{{ date }}*, '    +
                          '**[v{{ version }}]'   +
                          '(' + link + '-v{{ version }}.tar.gz)**\n',
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
    };
    
    function replaceVersion(name, version, versionNew, callback) {
        place(name, version, versionNew, function(error) {
            var msg;
            
            if (!error)
                msg = 'done: ' + name;
            
            callback(error, msg);
        });
    }
})();
