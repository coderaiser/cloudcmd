
(function(){
    "use strict";
    
    if(!global.cloudcmd)
        return console.log(
             '# appcache.js'                                    + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with Aplication Cache.'           + '\n'  +
             '# If you wont to see at work set appcache: true'  + '\n'  +
             '# in config.json and start cloudcmd.js'           + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        Util        = main.util,
    
    /* varible contain all watched file names
     * {name: true}
     */
        FileNames           = {},
        NamesList_s         = '',
        FallBack_s         = '',
    
    /* function thet use for crossplatform
     * access to fs.watch or fs.watchFile function
     */
        fs_watch            = null,
        on_fs_watch         = null,
        firstFileRead_b     = true,
        Manifest = '';
    
    setWatachFunctions();
    
    /* function add file or files to manifest
     * Examples:
     * exports.addFiles('jquery.js'), 
     * exports.addFiles(['jquery.js', 'client.js']);
     * exports.addFiles([{'http://cdn.jquery/jq.js':'jquery.js'}, 'client.js']);
     */
    exports.addFiles = function(pFileNames) {
        var i, n, lName, lCurrentName,
            watch = exports.watch;
        
        /* if a couple files */
        if (Util.isArray(pFileNames)) {
            n = pFilesNames.length;
            
            for (i = 0; i < n; i++) {
                /* if fallback setted up */
                lCurrentName = pFileNames[i];
                
                if (Util.isObject(lCurrentName))
                    for(lName in lCurrentName) {
                        FallBack_s += lName + ' ' + lCurrentName[lName] + '\n';
                        watch(lCurrentName[lName]);
                    }
                else
                    watch(pFileNames[i]);
            }
        } else
            watch(pFileNames);
        
    };
    
    
    exports.createManifest = function(){
        var lAllNames = main.require('node_modules/minify/hashes');
        if(lAllNames)
            for(var lName in lAllNames){
                if(lName.indexOf('min') > 0)
                    lName = 'node_modules/minify/min/' + lName;
                exports.watch(lName);
            }
        processManifest();
    };
    
    exports.watch = function(pFileName){
        Util.log(pFileName + ' is watched');
        
        if(!FileNames[pFileName] &&
            pFileName !== './cloudcmd.appcache'){
                    
            /* adding try...catch
             * if watched files would be more then system limit
             */
            var lWatch_f = function(){
                Util.tryCatch(function(){
                    fs_watch(pFileName, on_fs_watch(pFileName));
                });
            };
            
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
        if(main.WIN32){
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
    
    function onWatch (){
        return function(pEvent, pFileName){
            Util.log(pEvent);
            Util.log('file ' + pFileName + ' is changed');
            processManifest();
        };
    }
    
    function onWatchFile(pFileName){
        return function(pCurr, pPrev){
            if(pCurr.mtime !== pPrev.mtime){
                Util.log('file ' + pFileName + ' is changed');
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
            Util.log('cloudcmd.appcache refreshed');
        });
    }
})();
