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
             '# http://cloudcmd.io'                             + '\n');
    
    var main            = global.cloudcmd.main,
        mainpackage     = main.mainpackage || {},
        exec            = main.child_process.exec,
        Util            = main.util,
        DIR             = main.DIR;
    
    exports.get = function(){
        exec('git pull --rebase', {cwd : DIR}, pull);
    };
    
    /**
     * function pulls cloud cmd content from repo
     * @param pError
     * @param pStdout
     * @param pStderr
     */
  function pull(pError, pStdout, pStderr){
        var lExec, lMsg,
            lError      = pError || pStderr,
            lName       = mainpackage.name,
            lVersion    = mainpackage.version,
            lIsUpToDate = ' is up to date.';
        
        if(!pError) {
            pStderr = '';
            
            if (Util.isContainStr(pStdout, lIsUpToDate))
                lMsg = lIsUpToDate;
            else
                lMsg = ' updated, restart to use new version.';
            
            lMsg = lName + ' v' + lVersion + lMsg;
            
            lExec = pStderr || pError || lMsg;
            Util.log(lExec);
        } else
            Util.log(lError);
    }
})();
