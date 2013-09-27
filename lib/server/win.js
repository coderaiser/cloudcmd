/* 
 * Library contain windows specific functions
 * like getting information about volumes
 */
 
(function(){
    "use strict";
    
    if(!global.cloudcmd)
        return console.log(
             '# win.js'                                         + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with windows specific'            + '\n'  +
             '# functions like work with drives(etc c).'        + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main            = global.cloudcmd.main,
        Charset         ={
            UNICODE : 65001,
            WIN32   : 866
        },
        
        exec            = main.child_process.exec,
        Util            = main.util;
        
        
    exports.getVolumes  = function(pCallBack){
        var lCHCP       = 'chcp ' + Charset.UNICODE,
            lGetVolumes = 'wmic logicaldisk get name';
        
        exec(lCHCP + ' &&  ' + lGetVolumes, retProcessOuput(pCallBack));
    };
    
    
    function retProcessOuput(pCallBack){
        return function(pError, pStdout, pStderr){
            var lRemoveStr  = [
                    '\r', '\n',
                    'Name',
                    'Active code page: 65001  '
                ],
                lVolumes    = [],
                lError      = pError || pStderr;
            exec('chcp ' + Charset.WIN32);

            if(!lError) {
                lVolumes = Util.removeStr(pStdout, lRemoveStr)
                    .split('    ');

                lVolumes.pop();
            }
            
            Util.exec(pCallBack, lError || lVolumes);
        };
    }
})();
