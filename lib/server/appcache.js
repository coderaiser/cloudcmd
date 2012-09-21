var fs = require('fs');

/* varible contain all watched file names
 * {name: true}
 */
var FileNames           = {},
    NamesList_s         = '',
    FallBack_s         = '';

/* function thet use for crossplatform
 * access to fs.watch or fs.watchFile function
 */
var fs_watch            = null;
var on_fs_watch         = null;
var firstFileRead_b     = true;
var Manifest = '';

setWatachFunctions();

/* function add file or files to manifest
 * Examples:
 * exports.addFiles('jquery.js'), 
 * exports.addFiles(['jquery.js', 'client.js']);
 * exports.addFiles([{'http://cdn.jquery/jq.js':'jquery.js'}, 'client.js']);
 */
exports.addFiles = function(pFileNames){
    /* if a couple files */
    if(pFileNames instanceof Array)    
        for(var i=0; i < pFileNames.length; i++){
            /* if fallback setted up */
            var lCurrentName = pFileNames[i];
            if(typeof lCurrentName === 'object')
                for(var lName in lCurrentName){
                    FallBack_s += lName + ' ' + lCurrentName[lName] + '\n';
                    exports.watch(lCurrentName[lName]);
                }

            else exports.watch(pFileNames[i]);
        }
    else exports.watch(pFileNames);
    
};


exports.createManifest = function(){
    var lAllNames = cloudRequire(process.cwd() + '/hashes');
    if(lAllNames)
        for(var lName in lAllNames){
            if(lName.indexOf('min') > 0)
                lName = './min/' + lName;
            exports.watch(lName);
        }
    processManifest();
};

exports.watch = function(pFileName){
    console.log(pFileName + ' is watched');
    
    if(!FileNames[pFileName] &&
        pFileName !== './cloudcmd.appcache'){
                
        /* adding try...catch
         * if watched files would be more then system limit
         */
        var lWatch_f = tryCatch(function(){
                fs_watch(pFileName, on_fs_watch(pFileName));
            });
        /* if file.exists function exist and
         * file actually exists
         */
        if(fs.exists)
            fs.exists(pFileName, lWatch_f);
        else lWatch_f();

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
        console.log(pEvent);
        console.log('file ' + pFileName + ' is changed');
        processManifest();
    };
}

function onWatchFile(pFileName){
    return function(pCurr, pPrev){
        if(pCurr.mtime !== pPrev.mtime){
            console.log('file ' + pFileName + ' is changed');
            processManifest();
        }
    };
}

function processManifest(){
    Manifest = 'CACHE MANIFEST\n'   +
        '#' + new Date()   + '\n'   +
        'CACHE:\n'                  +
        NamesList_s                 +
        'NETWORK:\n'                +
        '*\n'                       +
        'FALLBACK:\n'               +
        FallBack_s;
        
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

/**
 * function execute param function in
 * try...catch block
 * 
 * @param pFunction_f
 */
function tryCatch(pFunction_f){
    return function(){
        var lRet = true;
        try{
            pFunction_f();
        }
        catch(pError){lRet = pError;}
        
        return lRet;
    };
}