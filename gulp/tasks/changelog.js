(function() {
    'use strict';
    
    var DIR         = '../../',
        fs          = require('fs'),
        exec        = require('child_process').exec,
        
        cl          = require('../cl'),
        Util        = require(DIR + 'lib/util'),
        Info        = require(DIR + 'package');
    
    module.exports = function() {
        var version     = 'v' + Info.version,
            name        = 'ChangeLog',
            
            gitTempl    = 'git log {{ version }}..HEAD --pretty=format:"- %s" --grep {{ category }} | sed  \'s/{{ category }}//g\'',
            
            gitFix      = Util.render(gitTempl, {
               category : 'fix' ,
               version  : version
            }),
            
            gitFeature  = Util.render(gitTempl, {
               category: 'feature',
               version  : version
            }),
            
            versionNew  = cl.getVersion();
        
        if (versionNew)
            versionNew  = 'v' + versionNew;
        else
            versionNew  = version + '?';
        
        Util.exec.parallel([
            Util.exec.with(fs.readFile, name, 'utf8'),
            Util.exec.with(exec, gitFix),
            Util.exec.with(exec, gitFeature),
            ], function(error, fileData, fixData, featureData) {
                var DATA        = 0,
                    STD_ERR     = 1,
                    fix         = fixData[DATA],
                    feature     = featureData[DATA],
                    date        = Util.getShortDate(),
                    head        = date + ', ' + versionNew + '\n\n',
                    data        = '';
                
                if (fix || feature) {
                    data        = head;
                    
                    if (fix) {
                        data    += 'fix:'       + '\n';
                        data    += fix          + '\n\n';
                    }
                    
                    if (feature) {
                        data    += 'feature:'   + '\n';
                        data    += feature      + '\n\n';
                    }
                    
                    data        += '\n';
                    data        += fileData;
                }
                
                error   = error || fixData[STD_ERR] || featureData[STD_ERR];
                
                if (error)
                    console.log(error);
                else if (!data)
                    console.log('No new feature and fix commits from v', version);
                else
                    fs.writeFile(name, data, function(error) {
                        var msg = 'changelog: done';
                        
                        console.log(error || msg);
                    });
            });
    };
})();
