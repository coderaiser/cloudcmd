(function(){
    'use strict';
    
    var main        = require('./main'), //global.cloudcmd.main,
        DIR         = main.DIR,
        
        fs          = main.fs,
        path        = main.path,
        Util        = main.util,
        
        /* object contains hashes of files*/
        CHANGESNAME  = DIR       + 'changes',
        CHANGES_JSON = CHANGESNAME   + '.json',
                
        Times = main.require(CHANGESNAME) || [],
        TimesChanged;
    
    function isFileChanged(pFileName, pLastFile_b, pCallBack){
        var lReadedTime;
        
        var i, n = Times.length;
        for(i = 0; i < n; i++){
            var lData = Times[i];
            
            /* if founded row with file name - save hash */
            if(lData.name === pFileName){
                lReadedTime = lData.time;
                break;
            }
        }
        
        fs.stat(pFileName, function(pError, pStat){
            var lTimeChanged;
            
            if(!pError){
                var lFileTime = pStat.mtime.getTime();
                  
                if(lReadedTime !== lFileTime){
                    Times[i]        = {
                        name: pFileName,
                        time: lFileTime
                    };
                    
                    lTimeChanged    =
                    TimesChanged    = true;
                }
                
                if(pLastFile_b && TimesChanged)
                    writeFile(CHANGES_JSON, Util.stringifyJSON(Times));
            }
            else{
                Util.log(pError);
                lTimeChanged = false;
            }
            
            Util.exec(pCallBack, lTimeChanged);
        });
    }
    
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
                Util.log('minify: file ' + path.basename(pFileName) + ' writed...');
        });
    }
    
    isFileChanged(DIR + 'favicon.ico', true, function(pData){
        console.log(pData)
    });
})();