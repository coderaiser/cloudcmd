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
        exec        = require('child_process').exec,
        DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        Util        = require(DIR + 'util'),
        pipe        = require(DIR_SERVER + 'pipe');
    
    exports.getVolumes          = getVolumes;
    exports.prepareCodePage     = prepareCodePage;
    
    function getVolumes(callback) {
        var wmic = spawn('wmic', ['logicaldisk', 'get', 'name']);
        
        Util.checkArgs(arguments, ['callback']);
        
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
    
    function prepareCodePage() {
        /* if we on windows and command is build in
         * change code page to unicode becouse
         * windows use unicode on non English versions
         */
         
        if (process.platform === 'win32')
            getCodePage(function(codepage) {
                if (codepage) {
                    process.on('SIGINT', function() {
                        exec('chcp ' + codepage, function() {
                            process.exit();
                        });
                    });
                    
                    exec('chcp 65001', function(error, stdout, stderror) {
                        if (error)
                            console.log(error);
                        
                        if (stderror)
                            console.log(stderror);
                     });
                }
            });
    }
    
    function getCodePage(callback) {
        exec('chcp', function(error, stdout, stderror) {
            var index, codepage;
            
            if (!error && !stderror && stdout) {
                index       = stdout.indexOf(':');
                codepage    = stdout.slice(index + 2);
            }
            
            callback(codepage);
        });
    }
    
})();
