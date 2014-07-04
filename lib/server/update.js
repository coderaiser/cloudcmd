/* module update cloud commander */

(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# update.js'                                      + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work update thru git.'                 + '\n'  +
             '# If you wont to see at work install git'         + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main            = global.cloudcmd.main,
        mainpackage     = main.mainpackage || {},
        exec            = require('child_process').exec,
        fs              = require('fs'),
        Util            = require('../util'),
        DIR             = main.DIR;
    
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
