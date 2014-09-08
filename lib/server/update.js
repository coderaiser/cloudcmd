/* module update cloud commander */

(function() {
    'use strict';
    
    var exec            = require('child_process').exec,
        fs              = require('fs'),
        path            = require('path'),
        Util            = require('../util'),
        
        DIR             = path.normalize(__dirname + '/../../'),
        
        mainpackage     = require(DIR + 'package');
    
    exports.get = function() {
        fs.readdir(DIR, function(error, files) {
            var cmd = 'git pull --rebase';
            
            if (!error &&  ~files.indexOf('.git'))
                exec(cmd, {cwd : DIR}, pull);
        });
    };
    
    /**
     * function pulls cloud cmd content from repo
     * @param error
     * @param stdout
     * @param stderr
     */
  function pull(error, stdout, stderr) {
        var msg,
            msgError    = error || stderr,
            name        = mainpackage.name,
            version     = mainpackage.version,
            isUpToDate  = ' is up to date.';
        
        if (msgError) {
            Util.log(msgError);
        } else {
            stderr  = '';
            
            if (Util.isContainStr(stdout, isUpToDate))
                msg = isUpToDate;
            else
                msg = ' updated, restart to use new version.';
            
            msg     = name + ' v' + version + msg;
            
            Util.log(msg);
        }
    }
})();
