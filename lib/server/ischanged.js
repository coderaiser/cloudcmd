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
    
    exports.isFileChanged = function(pFileName, pCallBack) {
        var lReadedTime, lData,
            i, n = Times.length;
        
        for (i = 0; i < n; i++) {
            lData = Times[i];
            
            /* if founded row with file name - save hash */
            if (lData.name === pFileName) {
                lReadedTime = lData.time;
                break;
            }
        }
        
        time.get(pFileName, function(error, fileTime) {
            var timeChanged;
            
            if (error) 
                Util.log(error);
            else if (lReadedTime !== fileTime)
                timeChanged = Times[i] = {
                    name: pFileName,
                    time: fileTime
                };
                
            
            if (timeChanged)
                writeFile(CHANGES_JSON, Util.stringifyJSON(Times));
            
            Util.exec(pCallBack, timeChanged);
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