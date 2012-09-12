/* Модуль проверяет поменялось ли содержимое файла по хэшу. */

var fs      = require('fs'),
    crypto  = require('crypto');

/* object contains hashes of files*/
var Hashes;

/*
 * Function reads hash table of files
 * checks is file changed or not
 * and return result.
 * @pFileName - name of file
 * @pFileData - data of file
 * result: boolean
 */
exports.check = function(pFileName, pFileData, pOverWrite_b){
        var lReadedHash;
        
        /* boolean hashes.json changed or not */
        var lHashesChanged_b = false;
        
        if(!Hashes)
            try {
                console.log('trying  to read hashes.json');
                Hashes = require(process.cwd() + '/hashes');
                
            }catch(pError) {
                console.log('hashes.json not found... \n');
                Hashes = {};
            }
        
        for(var lFileName in Hashes)
            /* if founded row with
             * file name - save hash
             */
            if (lFileName === pFileName) {
                lReadedHash = Hashes[pFileName];
                break;
        }
        
        /* create hash of file data */ 
        var lFileHash = crypto.createHash('sha1');
        lFileHash = crypto.createHash('sha1'); 
        lFileHash.update(pFileData);
        lFileHash = lFileHash.digest('hex');
                
        if(lReadedHash !== lFileHash){
            Hashes[pFileName] = lFileHash;
            lHashesChanged_b = true;
        }
                                
        if(pOverWrite_b){                                    
            /* if hashes file was changes - write it */
            if(lHashesChanged_b)
                fs.writeFile('./hashes.json',
                    JSON.stringify(Hashes),
                    fileWrited('./hashes.json'));
            else console.log('no one file has been changed');
        }
        /* has file changed? */
        return lHashesChanged_b;
};

/*
 * Функция вызываеться после записи файла
 * и выводит ошибку или сообщает,
 * что файл успешно записан
 */
function fileWrited(pFileName){
    "use strict";
    return function(error){
        console.log(error?error:('file '+pFileName+' writed...'));
    };
}