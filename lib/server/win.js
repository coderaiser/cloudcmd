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
             '# functions. Woud be work on win32 only.'         + '\n'  +
             '# http://coderaiser.github.com/cloudcmd'          + '\n');
    
    var main            = global.cloudcmd.main,
        
        SRVDIR          = main.SRVDIR,
        BATDIR          = SRVDIR        + 'win\\',
        GETVOLUMES      = BATDIR        + 'getvolumes',
        BAT             = GETVOLUMES    + '.bat',
        SCENARIO        = GETVOLUMES    + '.txt',
        StdOut,
        exec            = main.child_process.exec,
        Util            = main.util;
        
        
    /**
     * get position of current name of volume
     * @param pNumber = number of volume
     */
    function getPosition(pNumber){
        var lRet,
            lstrPattern     = 'Том ';
        
        lRet = StdOut.indexOf(lstrPattern + pNumber);
        
        return lRet;
    }
    
    /**
     * get name of volume
     * @param pPosition - current char position
     */
    function getVolumeName(pPosition){
        var lRet,
            lCharPosition   = 10;
            
        lRet =  StdOut[pPosition + lCharPosition];
        
        return lRet;
    }
    
    
    exec(BAT + ' -s ' + SCENARIO, processOuput);
    
    
    function processOuput(pError, pStdout, pStderr){
        StdOut = pStdout;
        if(!pError){
            var lVolumes        = [],
                i               = 0,
                lNum            = getPosition(i);
            
            do{
                lVolumes[i] = getVolumeName(lNum);
                lNum = getPosition(++i);
            }while(lNum > 0);
        }
        else
            Util.log(pError);
    }
})();
