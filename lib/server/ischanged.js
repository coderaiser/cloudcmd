(function() {
    'use strict';
    
    var 
        DIR_JSON        = __dirname + '/../../json/',
        
        fs              = require('fs'),
        path            = require('path'),
        Util            = require('../util'),
        time            = require('./timem'),
        
        CHANGES_NAME    = DIR_JSON + 'changes',
        CHANGES_JSON    = CHANGES_NAME + '.json',
        
        Times           = {};
        
        Util.exec.try(function() {
            Times = require(CHANGES_NAME);
        });
        
    module.exports = function(name, callback) {
        var readTime = Times[name];
        
        Util.checkArgs(arguments, ['name', 'callback']);
        
        time.get(name, 'raw', function(error, fileTime) {
            var json, timeChanged;
            
            if (!error && readTime !== fileTime) {
                timeChanged     = true;
                Times[name]     = fileTime;
                json            = Util.stringifyJSON(Times);
                
                writeFile(CHANGES_JSON, json);
            }
            
            callback(error, timeChanged);
        });
    };
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(name, data) {
        fs.writeFile(name, data, function(error) {
            var baseName    = path.basename(name),
                msg         = 'file ' +  baseName + ' written...';
            
            Util.log(error || msg);
        });
    }
})();
