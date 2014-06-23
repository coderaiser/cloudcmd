/* 
 * Library contain windows specific functions
 * like getting information about volumes
 */
 
(function() {
    'use strict';
    
    /* win.js
    * -----------
    *
    * used for work with windows specific
    * functions like volumes.
    */
    
    var processExec     = require('child_process').exec,
        DIR             = '../',
        Util            = require(DIR + 'util');
    
    exports.getVolumes  = getVolumes;
    
    function getVolumes(callback) {
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
            
            Util.exec(callback, error, volumes);
        });
    }
})();
