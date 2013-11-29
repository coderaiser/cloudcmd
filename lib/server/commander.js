(function() {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
            '# commander.js'                                    + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for getting dir content.'                   + '\n'  +
            '# and forming html content'                        + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
            
    var main                = global.cloudcmd.main,
        fs                  = main.fs,
        Util                = main.util,
        checkParams         = main.checkCallBackParams;
    
    exports.getDirContent = function(pPath, pCallBack) {
        var lRet = Util.isString(pPath);
        
        if (lRet)
            fs.readdir(pPath, Util.call(readDir, {
                callback: pCallBack,
                path    : pPath
            }));
        else
            Util.exec(pCallBack, "First parameter should be a string");
        
        return lRet;
    };
    
    
    /**
     * Функция читает ссылку или выводит информацию об ошибке
     * @param pError
     * @param pFiles
     */
    function readDir(pParams) {
        var lRet = checkParams(pParams);
            lRet = lRet && Util.checkObj(pParams.params, ['path']);
        
        if (lRet) {
            var p           = pParams,
                c           = pParams.params,
                lFiles      = p.data,
                lDirPath    = getDirPath(c.path);
            
            if (!p.error && lFiles) {
                lFiles.data = lFiles.sort();
                
                /* Получаем информацию о файлах */
                var n           = lFiles.length,
                    lStats      = {},
                    lFilesData  = {
                        files       : lFiles,
                        stats       : lStats,
                        callback    : c.callback,
                        path        : c.path
                    },
                    
                    lFill       = Util.retFunc(fillJSON, lFilesData);
                
                if (n)
                    for (var i = 0; i < n; i++) {
                        var lName = lDirPath + lFiles[i],
                            lParams =  {
                                callback    : lFill,
                                count       : n,
                                name        : lFiles[i],
                                stats       : lStats,
                            };
                        
                        fs.stat(lName, Util.call(getFilesStat, lParams));
                    }
                else
                    fillJSON(lFilesData);
            } else
                Util.exec(c.callback, p.error.toString());
        }
    }
    
    /**
     * async getting file states
     * and putting it to lStats object
     */
    function getFilesStat(pParams) {
        var lRet = checkParams(pParams);
            lRet = lRet && Util.checkObjTrue(pParams.params,
                ['callback', 'stats', 'name', 'count']);
        
        if (lRet) {
            var p = pParams,
                c = p.params;
            
            c.stats[c.name] = !p.error ? p.data   : {
                'mode'          : 0,
                'size'          : 0,
                'isDirectory'   : Util.retFalse
            };
            
            if (c.count === Object.keys(c.stats).length)
                Util.exec(c.callback);
        }
    }
    
    /**
     * Function fill JSON by file stats
     *
     * @param pStats - object, contain file stats.
     *          example {'1.txt': stat}
     *
     * @param pFiles - array of files of current directory
     */
    function fillJSON(pParams) {
        var name, stat, mode, isDir, size, uid,
            p, i, n, file, path, json,
            ret         = Util.checkObjTrue(pParams, ['files', 'stats', 'path']);
        
        if (ret) {
            p           = pParams;
            n           = p.files.length;
                
            /* данные о файлах в формате JSON*/
            file        = {};
            path        = getDirPath(p.path);
            json        = [{
                path    : path,
                size    : 'dir'
            }];
            
            for (i = 0; i < n; i++ ) {
                /* Переводим права доступа в 8-ричную систему */
                name    = p.files[i];
                stat    = p.stats[name];
                uid     = stat.uid;
                
                if (stat) {
                    mode    = Number(stat.mode).toString(8);
                    isDir   = stat.isDirectory();
                    size    = isDir ? 'dir' : stat.size;
                }
                
                /* Если папка - выводим пиктограмму папки   *
                 * В противоположном случае - файла         */
                file = {
                    'name'  : p.files[i],
                    'size'  : size,
                    'uid'   : uid,
                    'mode'  : mode
                };
                
                json.push(file);
            }
            
            json = changeOrder(json);
            
            Util.exec(p.callback, null, json);
            
        }
    }
    
     function changeOrder(json) {
        var file, i, n,
            files   = [],
            dirs    = [], 
            current = [],
            path    = json[0],
            sorted  = [path];
        
        n = json.length;
        for (i = 1; i < n; i++) {
            current = json[i];
            
            if (current.size === "dir")
                dirs.push(current);
            else 
                files.push(current);
        }
        
        n = dirs.length;
        for (i = 0; i < n; i++) {
            current = dirs[i];
            sorted.push(current);
        }
        
        n = files.length;
        for (i = 0; i < n; i++) {
            current = files[i];
            sorted.push(current);
        }
        
        return sorted;
    }
    
    function getDirPath(pPath) {
        var lRet = pPath;
        
        if (lRet !== '/')
            lRet += '/';
        
        return lRet;
    }
    
})();