/* module update cloud commander */

var exec            = require('child_process').exec,
    packagejson     = cloudRequire('package.json');

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
        if(pStdout !== 'Already up-to-date.\n'){
            pStdout = 'Cloud Commander updated. Restart to use new version.';
        }
        else pStdout = 'Cloud Commander is up to date.';
        
        if(packagejson)
            pStdout = 'Version ' + packagejson.version + '\n' + pStdout;
    }
    
    var lExec = {
        stdout : pStdout,
        stderr : pStderr || pError
    };
    
    console.log(lExec);
}

/**
 * function do safe require of needed module
 * @param pModule
 */
function cloudRequire(pModule){
  try{
      return require(pModule);
  }
  catch(pError){
      return false;
  }
}