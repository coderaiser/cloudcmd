var fs = require('fs');
var crypto = require('crypto');

/* varible contain all watched file names
 * {name: true}
 */
var FileNames           = {};

/* function thet use for crossplatform
 * access to fs.watch or fs.watchFile function
 */
var fs_watch            = null;
var on_fs_watch         = null;
var firstFileRead_b     = true;
var Manifest = '';

setWatachFunctions();

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

exports.watch = function(pFileName){
    console.log(pFileName + ' is watched');
    
    if(!FileNames[pFileName]){
        try{
            fs_watch(pFileName, on_fs_watch(pFileName));
        }
        catch(pError){
            console.log(pError);
        }
        Manifest += pFileName + '\n';
        FileNames[pFileName] = true;
    }
    else if(firstFileRead_b){
        processManifest();
        firstFileRead_b = false;
    }
};

function onWatch (pFileName){
    return function(pEvent, pFileName){
        console.log('file ' + pFileName + 'is changed');
    };
}

function onWatchFile(pFileName){
    return function(pCurr, pPrev){
        console.log(pCurr);
        if(pCurr.mtime !== pCurr.pPrev.mtime)
            console.log('file ' + pFileName + 'is changed');
    };
}

function processManifest(){
    Manifest = 'CACHE MANIFEST\n'   +
        '#' + new Date()   + '\n'   +
        'CACHE:\n'                  +
        Manifest                    +
        'NETWORK:\n'                +
        '*';
    
    console.log(Manifest);
        fs.writeFile('cloudcmd.appcache', Manifest, function(){
            console.log('cloudcmd.appcache refreshed');
        });
}