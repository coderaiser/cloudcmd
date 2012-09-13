var fs = require('fs');

/* varible contain all watched file names
 * {name: true}
 */
var FileNames           = {},
    NamesList_s         = '';

/* function thet use for crossplatform
 * access to fs.watch or fs.watchFile function
 */
var fs_watch            = null;
var on_fs_watch         = null;
var firstFileRead_b     = true;
var Manifest = '';

setWatachFunctions();


exports.createManifest = function(){
    var lAllNames = cloudRequire(process.cwd() + 'hashes.json');
    if(lAllNames)
        for(var lName in lAllNames)
            exports.watch(lName);
    processManifest();
};

exports.watch = function(pFileName){
    console.log(pFileName + ' is watched');
    
    if(!FileNames[pFileName]){
        fs_watch(pFileName, on_fs_watch(pFileName));

        NamesList_s += pFileName + '\n';
        FileNames[pFileName] = true;
    }
    else if(firstFileRead_b){
        processManifest();
        firstFileRead_b = false;
    }
};

function setWatachFunctions(){
    if(process.platform === 'win32'){
        /* good on windows  */
        fs_watch    = fs.watch;
        on_fs_watch = onWatch;
    }        
    else{
        /* good on linux    */
        fs_watch    = fs.watchFile;
        on_fs_watch = onWatchFile;
    }

}

function onWatch (pFileName){
    return function(pEvent, pFileName){
        console.log('file ' + pFileName + 'is changed');
    };
}

function onWatchFile(pFileName){
    return function(pCurr, pPrev){
        console.log(pCurr);
        if(pCurr.mtime !== pPrev.mtime)
            console.log('file ' + pFileName + 'is changed');
    };
}

function processManifest(){
    Manifest = 'CACHE MANIFEST\n'   +
        '#' + new Date()   + '\n'   +
        'CACHE:\n'                  +
        NamesList_s                 +
        'NETWORK:\n'                +
        '*';
    
    console.log(Manifest);
        fs.writeFile('cloudcmd.appcache', Manifest, function(){
            console.log('cloudcmd.appcache refreshed');
        });
}

/* function do safe require of needed module */
function cloudRequire(pModule){
  try{
      return require(pModule);
  }
  catch(pError){
      return false;
  }
}