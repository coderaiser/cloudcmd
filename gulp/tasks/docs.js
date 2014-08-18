(function() {
    'use strict';
    
    var DIR         = '../../',
        fs          = require('fs'),
        
        cl          = require('../cl'),
        Util        = require(DIR + 'lib/util'),
        Info        = require(DIR + 'package');
        
    module.exports = function() {
        var history     = 'Version history\n---------------\n',
            link        = '//github.com/cloudcmd/archive/raw/master/cloudcmd',
            template    = '- *{{ date }}*, '    +
                          '**[v{{ version }}]'   +
                          '(' + link + '-v{{ version }}.zip)**\n',
            version     = Info.version,
            versionNew  = cl.getVersion();
        
        if (!versionNew) {
            cl.showVersionError();
        } else {
            replaceVersion('README.md', version, versionNew);
            replaceVersion('HELP.md', version, versionNew, function() {
                var historyNew = history + Util.render(template, {
                    date    : Util.getShortDate,
                    version : versionNew
                });
                
                replaceVersion('HELP.md', history, historyNew);
            });
        }
    };
    
    function replaceVersion(name, version, versionNew, callback) {
         fs.readFile(name, 'utf8', function(error, data) {
                if (error) {
                    console.log(error);
                } else {
                    data = data.replace(version, versionNew);
                    
                    fs.writeFile(name, data, function(error) {
                        var msg = 'done: ' + name;
                        
                        console.log(error || msg);
                        Util.exec(callback);
                    });
                }
            });
    }
})();
