/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# dir.js'                                          + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for getting dir size.'                      + '\n'  +
            '# If you wont to see at work'                      + '\n'  +
            '# try GET /api/v1/fs/etc?size or'                  + '\n'  +
            '# dir.getSize(\'/etc, function(err, size) {'       + '\n'  +
            '# });'                                             + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
             
    var main    = global.cloudcmd.main,
        fs      = main.fs,
        Util    = main.util,
        path    = main.path;
    
    exports.getSize = function(pDir, pCallBack) {
        var lTotal          = 0;
        
        function calcSize(pParams){
            var lStat   = pParams.stat,
                lSize   = lStat && lStat.size || 0;
            
            lTotal      += lSize;
        }
        
        processDir(pDir, calcSize, function(){
            Util.log(pDir + ' -> ' + lTotal);
            Util.exec(pCallBack, null, lTotal);
        });
    };
   
    function processDir(pDir, pFunc, pCallBack){
        var lAsyncRunning   = 0,
            lFileCounter    = 1;
        
        function getDirInfo(pDir) {
            /*  The lstat() function shall be equivalent to stat(),
                except when path refers to a symbolic link. In that case lstat()
                shall return information about the link, while stat() shall return
                information about the file the link references. */
            
            fs.lstat(pDir, Util.call(getStat, {
                name: pDir
            }));
        }
        
        function getStat(pParams) {
            var lRet = Util.checkObj(pParams, ['params']);
            if(lRet){
                var p       = pParams,
                    d       = p.params,
                    lStat   = p.data,
                    lPath   = d.name;
                
                --lFileCounter;
                
                if (!p.error) {
                    if ( lStat.isFile() )
                        Util.exec(pFunc, {
                            name: d.name,
                            stat: lStat
                        });
                    else if ( lStat.isDirectory() ) {
                        ++lAsyncRunning;
                        
                        fs.readdir(lPath, function(pError, pFiles) {
                            lAsyncRunning--;
                            
                            var lDirPath, n;
                            
                            if (!pError){
                                n                = pFiles.length;
                                lFileCounter    += n;
                                
                                for (var i = 0; i < n; i++) {
                                    lDirPath = path.join(lPath, pFiles[i]);
                                    process.nextTick(Util.retFunc(getDirInfo, lDirPath));
                                }
                            }
                            
                            if(!n)
                                execCallBack();
                        });
                    }
                }
            }
            
            execCallBack();
        }
        
        function execCallBack(){
            if (!lFileCounter && !lAsyncRunning)
                Util.exec(pCallBack);
        }
        
        getDirInfo(pDir);
   }
})();