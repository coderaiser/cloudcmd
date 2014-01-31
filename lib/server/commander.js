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
        users               = main.users,
        
        WIN32               = main.WIN32,
        
        checkParams         = main.checkCallBackParams;
    
    exports.getDirContent = function(path, callback) {
        var ret = Util.isString(path);
        
        if (!ret)
            Util.exec(callback, "First parameter should be a string");
        else
            fs.readdir(path, function(error, files) {
                readDir(error, files, {
                    callback    : callback,
                    path        : path
                });
            });
        
        return ret;
    };
    
    
    /**
     * Функция читает ссылку или выводит информацию об ошибке
     * @param pError
     * @param pFiles
     */
    function readDir(error, files, params) {
        var i, n, stats, filesData, fill, name, fileParams,

        p               = params,
        dirPath         = getDirPath(p.path);
        
        if (error)
             Util.exec(p.callback, error.toString());
        else {
            /* Получаем информацию о файлах */
            n           = files.length,
            stats       = {},
            
            filesData   = {
                files       : files,
                stats       : stats,
                callback    : p.callback,
                path        : p.path
            },
            
            fill        = Util.retFunc(fillJSON, filesData);
            
            if (n)
                for (i = 0; i < n; i++) {
                    name        = dirPath + files[i],
                    
                    fileParams  =  {
                        callback    : fill,
                        count       : n,
                        name        : files[i],
                        stats       : stats,
                    };
                    
                    fs.stat(name, Util.call(getFilesStat, fileParams));
                }
            else
                fillJSON(filesData);
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
        var name, stat, mode, isDir, size, owner, modeStr,
            p, i, n, file, path, json, files,
            ret         = Util.checkObjTrue(pParams, ['files', 'stats', 'path']);
        
        if (ret) {
            p           = pParams;
            n           = p.files.length;
                
            /* данные о файлах в формате JSON*/
            file        = {};
            path        = getDirPath(p.path);
            json        = {
                path    : path,
                files   : []
            },
            files       = json.files;
            
            for (i = 0; i < n; i++ ) {
                name    = p.files[i];
                stat    = p.stats[name];
                owner   = stat.uid;
                
                if (stat) {
                    /* Переводим права доступа в 8-ричную систему */
                    modeStr = Number(stat.mode).toString(8);
                    mode    = Number(modeStr);
                    isDir   = stat.isDirectory();
                    size    = isDir ? 'dir' : stat.size;
                }
                
                file = {
                    'name'  : name,
                    'size'  : size,
                    'owner' : owner,
                    'mode'  : mode
                };
                
                files.push(file);
            }
            
            json.files = changeOrder(files);
            
            changeUIDToName(json, function() {
                Util.exec(p.callback, null, json);
            });
        }
    }
    
    function changeUIDToName(json, callback) {
        Util.ifExec(WIN32, callback, function() {
            users.getNames(function(error, names) {
                var i, n, current, owner,
                    files = json.files;
                
                Util.log(error);
                
                n = files.length;
                for (i = 0; i < n; i++) {
                    current         = files[i];
                    
                    owner           = current.owner;
                    owner           = names[owner];
                    
                    if (owner)
                        current.owner   = owner;
                }
                
                callback();
            });
        });
    }
    
    
     function changeOrder(json) {
        var file, i, n,
            files   = [],
            dirs    = [], 
            current = [],
            sorted  = [];
        
        n = json.length;
        for (i = 0; i < n; i++) {
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