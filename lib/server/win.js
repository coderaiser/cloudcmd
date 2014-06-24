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
    
    var spawn       = require('child_process').spawn,
        DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        Util        = require(DIR + 'util'),
        pipe        = require(DIR_SERVER + 'pipe');
    
    exports.getVolumes  = getVolumes;
    
    function getVolumes(callback) {
        var wmic = spawn('wmic', ['logicaldisk', 'get', 'name']);
        
        /* stream should be closed on win xp*/
        wmic.stdin.end();
        
        pipe.getBody(wmic.stdout, function(error, data) {
            if (error)
                callback(error);
            else
                parse(data, callback);
        });
        
        wmic.stderr.on('data', callback);
        wmic.on('error', callback);
    }
    
    function parse(data, callback) {
        var volumes     = [],
            strDrop     = [
                '\r', '\n',
                'Name', '  ',
            ];
        
        if (data) {
            volumes = Util.rmStr(data, strDrop)
                .split(':');
            
            volumes.pop();
        }
        
        callback(null, volumes);
    }
})();
