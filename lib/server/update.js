/* module update cloud commander */

var exec            = require('child_process').exec;

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
    if (pError !== null) {
        console.log('exec error: ' + pError);
    }

    var lExec = {
        stdout : pStdout,
        stderr : pStderr || pError
    };        
            
    console.log(lExec);
}