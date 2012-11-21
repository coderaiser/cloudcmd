/* module update cloud commander */

(function(){
    "use strict";

    var main            = global.cloudcmd.main,
        mainpackage     = main.mainpackage,
        exec            = main.child_process.exec;
    
    exports.get = function(){
        exec('git pull', pull);
    };
    
    /**
     * function pulls cloud cmd content from repo
     * @param pError
     * @param pStdout
     * @param pStderr
     */
    function pull(pError, pStdout, pStderr){
        
        if(!pError){
            pStderr = '';
            if(pStdout !== 'Already up-to-date.\n'){
                pStdout = 'Cloud Commander updated. Restart to use new version.';
            }
            else pStdout = 'Cloud Commander is up to date.';
            
            console.log( process.cwd() );
            if(mainpackage)
                pStdout = 'Version ' + mainpackage.version + '\n' + pStdout;
        }
        
        var lExec = {
            stdout : pStdout,
            stderr : pStderr || pError
        };
        
        console.log(lExec);    
    }
})();
