/* module update cloud commander */

(function(){
    "use strict";
    
    var main            = global.cloudcmd.main,
        mainpackage     = main.mainpackage,
        exec            = main.child_process.exec,
        Util            = main.util,
        DIR             = main.DIR;
    
    exports.get = function(){
        var lPull = function(){
            exec('git pull', pull);
        };
        
        if( process.cwd === DIR )
            lPull();
        else 
            exec('cd ' + DIR, lPull);
    };
    
    /**
     * function pulls cloud cmd content from repo
     * @param pError
     * @param pStdout
     * @param pStderr
     */
    function pull(pError, pStdout, pStderr){        
        var lExec;
        
        if(!pError){
            pStderr = '';
            if(pStdout !== 'Already up-to-date.\n'){
                pStdout = 'Cloud Commander updated. Restart to use new version.';
            }
            else pStdout = 'Cloud Commander is up to date.';
            
            console.log(DIR);
            if(mainpackage)
                pStdout = 'Version ' + mainpackage.version + '\n' + pStdout;
            
            lExec = {
                stdout : pStdout,
                stderr : pStderr || pError
            };
        }else
            lExec = 'install git to get auto updates (works for cloned versinons)\n' +
                    'git clone http://github.com/coderaiser/cloudcmd';
        
        
        
        Util.log(lExec);
    }
})();
