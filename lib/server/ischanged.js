(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        JSONDIR         = main.JSONDIR,
        
        fs              = require('fs'),
        path            = require('path'),
        Util            = require('../util'),
        time            = require('./time'),
        
        CHANGES_NAME    = JSONDIR       + 'changes',
        CHANGES_JSON    = CHANGES_NAME  + '.json',
        
        Times           = main.require(CHANGES_NAME) || {};
        
    exports.isFileChanged = function(name, callback) {
        var readTime = Times[name];
        
        time.get(name, 'raw', function(error, fileTime) {
            var json, timeChanged;
            
            if (error) {
                Util.log(error);
            } else if (readTime !== fileTime) {
                timeChanged     = true;
                Times[name]     = fileTime;
                json            = Util.stringifyJSON(Times);
                
                writeFile(CHANGES_JSON, json);
            }
            
            Util.exec(callback, timeChanged);
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
