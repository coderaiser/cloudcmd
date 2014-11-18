(function() {
    'use strict';
    
    var DIR         = '../../',
        fs          = require('fs'),
        
        cl          = require('../cl'),
        Util        = require(DIR + 'lib/util'),
        Info        = require(DIR + 'package');
        
    module.exports = function(callback) {
        var history     = 'Version history\n---------------\n',
            link        = '//github.com/cloudcmd/archive/raw/master/cloudcmd',
            template    = '- *{{ date }}*, '    +
                          '**[v{{ version }}]'   +
                          '(' + link + '-v{{ version }}.zip)**\n',
            version     = Info.version;
        
        cl(function(error, versionNew) {
            if (error) {
                callback(error);
            } else {
                replaceVersion('README.md', version, versionNew, callback);
                replaceVersion('HELP.md', version, versionNew, function() {
                    var historyNew = history + Util.render(template, {
                        date    : Util.getShortDate,
                        version : versionNew
                    });
                    
                    replaceVersion('HELP.md', history, historyNew, callback);
                });
            }
        });
    };
    
    function replaceVersion(name, version, versionNew, callback) {
        fs.readFile(name, 'utf8', function(error, data) {
            if (error)
                callback(error);
            else
                fs.writeFile(
                    name,
                    data.replace(version, versionNew),
                    function(error) {
                        callback(error, 'done: ' + name);
                    });
        });
    }
})();
