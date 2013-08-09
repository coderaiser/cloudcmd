(function(){
    'use strict';
    
    var main            = global.cloudcmd.main,
        JSONDIR         = main.JSONDIR,
        
        fs              = main.fs,
        path            = main.path,
        Util            = main.util,
        
        CHANGESNAME     = JSONDIR       + 'changes',
        CHANGES_JSON    = CHANGESNAME   + '.json',
        
        Times           = main.require(CHANGESNAME) || [];
    
    exports.isFileChanged = function(pFileName, pCallBack){
        var lReadedTime, lData,
            i, n = Times.length;
        
        for(i = 0; i < n; i++){
            lData = Times[i];
            
            /* if founded row with file name - save hash */
            if(lData.name === pFileName){
                lReadedTime = lData.time;
                break;
            }
        }
        
        fs.stat(pFileName, function(pError, pStat){
            var lTimeChanged, lFileTime;
            
            if (!pError) {
                lFileTime = pStat.mtime.getTime();
                  
                if(lReadedTime !== lFileTime)
                    lTimeChanged = Times[i]        = {
                        name: pFileName,
                        time: lFileTime
                    };
            }
            else
                Util.log(pError);
            
            if(lTimeChanged)
                writeFile(CHANGES_JSON, Util.stringifyJSON(Times));
            
            Util.exec(pCallBack, lTimeChanged);
        });
    };
    
    /*
     * Функция записывает файла
     * и выводит ошибку или сообщает,
     * что файл успешно записан
     */
    function writeFile(pFileName, pData){
        fs.writeFile(pFileName, pData, function(pError){
            if(pError)
                Util.log(pError);
            else
                Util.log('file ' + path.basename(pFileName) + ' writed...');
        });
    }
})();