(function() {
    'use strict';
    
    var main            = global.cloudcmd.main,
        JSONDIR         = main.JSONDIR,
        
        fs              = main.fs,
        path            = main.path,
        Util            = main.util,
        time            = main.time,
        
        CHANGESNAME     = JSONDIR       + 'changes',
        CHANGES_JSON    = CHANGESNAME   + '.json',
        
        Times           = main.require(CHANGESNAME) || [];
    
    exports.isFileChanged = function(name, callback) {
        var readTime, data,
            i, n = Times.length;
        
        for (i = 0; i < n; i++) {
            data = Times[i];
            /* if founded row with file name - save hash */
            if (data.name === name) {
                readTime = data.time;
                break;
            }
        }
        
        time.get(name, function(error, fileTime) {
            var timeChanged;
            
            if (error) 
                Util.log(error);
            else if (readTime !== fileTime) {
                timeChanged = true;
                
                Times[i]    = {
                    name: name,
                    time: fileTime
                };
                
                writeFile(CHANGES_JSON, Util.stringifyJSON(Times));
            }
            
            Util.exec(callback, timeChanged);
        });
    };
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(pFileName, pData) {
        fs.writeFile(pFileName, pData, function(pError) {
            if (pError)
                Util.log(pError);
            else
                Util.log('file ' + path.basename(pFileName) + ' writed...');
        });
    }
})();