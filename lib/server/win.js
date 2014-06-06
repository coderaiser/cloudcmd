/* 
 * Library contain windows specific functions
 * like getting information about volumes
 */
 
(function(){
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# win.js'                                         + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with windows specific'            + '\n'  +
             '# functions like work with drives(etc c).'        + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main            = global.cloudcmd.main,
        processExec     = main.child_process.exec,
        Util            = main.util;
        
    exports.getVolumes  = function(callback) {
        processExec('wmic logicaldisk get name', function(error, stdout, stderr) {
            var volumes     = [],
                removeStr   = [
                    '\r', '\n',
                    'Name', '  ',
                ];
            
            if (!error)
                error = stderr;
            
            if(!error) {
                volumes = Util.rmStr(stdout, removeStr)
                    .split(':');
                
                volumes.pop();
            }
            
            Util.exec(callback, error || volumes);
        });
    };
})();
