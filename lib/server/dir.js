/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
             '# dirsize.js'                                     + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for getting dir size.'                     + '\n'  +
             '# If you wont to see at work'                     + '\n'  +
             '# try GET /api/v1/fs/etc?size or'                 + '\n'  +
             '# dir.getSize(\'/etc, function(err, size){'   + '\n'  +
             '# });'                 + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
             
    var main    = global.cloudcmd.main,
        fs      = main.fs,
        path    = main.path;
    
    exports.getSize = function(pDir, pCallBack) {
        var lAsyncRunning   = 0,
            lFileCounter    = 1,
            lTotal          = 0;
        
        function getDirSize(pDir) {
            /*  The lstat() function shall be equivalent to stat(),
                except when path refers to a symbolic link. In that case lstat()
                shall return information about the link, while stat() shall return
                information about the file the link references. */
            
            fs.lstat(pDir, function(pError, pStat) {
                --lFileCounter;
                
                if (!pError) {
                    if ( pStat.isFile() )
                        lTotal += pStat.size;
                    else if ( pStat.isDirectory() ) {
                        ++lAsyncRunning;
                        
                        fs.readdir(pDir, function(pError, pFiles) {
                            lAsyncRunning--;
                            
                            if (!pError){
                                lFileCounter += pFiles.length;
                                
                                var lDirPath;
                                for (var i = 0, n = pFiles.length; i < n; i++) {
                                    lDirPath = path.join(pDir, pFiles[i]);
                                    getDirSize(lDirPath);
                                }
                            }
                        });
                    }
                }
                
                if (!lFileCounter && !lAsyncRunning)
                    pCallBack(null, lTotal);
                });
            }
        
        return getDirSize(pDir);
    };
})();