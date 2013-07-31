/* module update cloud commander */

(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
             '# update.js'                                      + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work update thru git.'                 + '\n'  +
             '# If you wont to see at work install git'         + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
    
    var main            = global.cloudcmd.main,
        mainpackage     = main.mainpackage || {},
        exec            = main.child_process.exec,
        Util            = main.util,
        DIR             = main.DIR;
    
    exports.get = function(){
        exec('git pull', {cwd : DIR}, pull);
    };
    
    /**
     * function pulls cloud cmd content from repo
     * @param pError
     * @param pStdout
     * @param pStderr
     */
  function pull(pError, pStdout, pStderr){
        var lExec, lStdout,
            lError      = pError || pStderr,
            lName       = mainpackage.name,
            lVersion    = mainpackage.version;
        
        if(!pError) {
            pStderr = '';
            
            if (pStdout !== 'Already up-to-date.\n')
                lStdout = ' updated, restart to use new version.';
            else
                lStdout = ' is up to date.';
            
            lStdout = lName + ' v' + lVersion + lStdout;
            
            lExec = pStderr || pError || lStdout;
            Util.log(lExec);
        } else
            Util.log(lError);
    }
})();
