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
        Charset         ={
            UNICODE : 65001,
            WIN32   : 866
        },
        
        exec            = main.child_process.exec,
        Util            = main.util;
        
        
    exports.getVolumes  = function(pCallBack){
        var SRVDIR      = '.\\',
            BATDIR      = SRVDIR + 'win\\',
            SCENARIO    = BATDIR + 'getvolumes.txt',
            lCHCP       = 'chcp ' + Charset.UNICODE,
            lDiskPart   = 'diskpart -s' + SCENARIO;
        
        exec(lCHCP + ' &&  ' + lDiskPart, retProcessOuput(pCallBack));
    };
    
    
    function retProcessOuput(pCallBack){
        return function(pError, pStdout, pStderr){
            /**
             * get position of current name of volume
             * @param pNumber = number of volume
             */
            var getPosition = function(pNumber){
                var lRet,
                    lstrPattern     = 'Том ';
                
                lRet = pStdout.indexOf(lstrPattern + pNumber);
                
                return lRet;
            };
            
            /**
             * get name of volume
             * @param pPosition - current char position
             */
            var getVolumeName = function (pPosition){
                var lRet,
                    lCharPosition   = 10;
                    
                lRet =  pStdout[pPosition + lCharPosition];
                
                return lRet;
            };
            
            var lVolumes        = [];
            
            exec('chcp ' + Charset.WIN32);
                        
            if(!pError){
                var i               = 0,
                    lNum            = getPosition(i);
                
                do{
                    lVolumes[i] = getVolumeName(lNum);
                    lNum = getPosition(++i);
                }while(lNum > 0);
            }
            else
                Util.log(pError);
            
            Util.exec(pCallBack, lVolumes);
        };
    }
})();
