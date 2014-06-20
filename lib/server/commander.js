(function() {
    'use strict';
    
    /*
        '# commander.js'                                    + '\n'  +
        '# -----------'                                     + '\n'  +
        '# Module is part of Cloud Commander,'              + '\n'  +
        '# used for getting dir content.'                   + '\n'  +
        '# and forming html content'                        + '\n'  +
        '# http://cloudcmd.io'                              + '\n');
    */
    
    var fs                  = require('fs'),
    
        DIR                 = '../',
        DIR_SERVER          = DIR + 'server/',
        
        Util                = require(DIR           + 'util'),
        format              = require(DIR_SERVER    + 'format'),
        users               = require(DIR_SERVER    + 'users'),
        
        WIN32               = process.platform === 'win32';
    
    exports.getDirContent = function(path, callback) {
        var isString = Util.isString(path);
        
        if (!isString)
            Util.exec(callback, 'First parameter should be a string');
        else
            fs.readdir(path, readDir.bind(null, {
                callback    : callback,
                path        : path
            }));
    };
    
    
    /**
     * Функция читает ссылку или выводит информацию об ошибке
     * @param pError
     * @param pFiles
     */
    function readDir(params, error, files) {
        var i, n, stats, filesData, fill, name, fileParams,
            p               = params,
            dirPath         = addSlashToEnd(p.path);
        
        if (error)
             Util.exec(p.callback, error);
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
            
            fill        = fillJSON.bind(null, filesData);
            
            if (n)
                for (i = 0; i < n; i++) {
                    name        = dirPath + files[i],
                    
                    fileParams  =  {
                        callback    : fill,
                        count       : n,
                        name        : files[i],
                        stats       : stats,
                    };
                    
                    fs.lstat(name, onStat.bind(null, fileParams));
                }
            else
                fillJSON(filesData);
        }
    }
    
    /**
     * async getting file states
     * and putting it to stats object
     */
    function onStat(params, error, stat) {
        var n, keys, p       = params;
        
        if (!error)
            p.stats[p.name] = stat;
        else
            p.stats[p.name] = {
                'mode'          : 0,
                'size'          : 0,
                'isDirectory'   : Util.retFalse
            };
        
        keys    = Object.keys(p.stats);
        n       = keys.length;
        
        if (p.count === n)
            Util.exec(p.callback);
    }
    
    /**
     * Function fill JSON by file stats
     *
     * @param stats - object, contain file stats.
     *          example {'1.txt': stat}
     *
     * @param files - array of files of current directory
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
            path        = addSlashToEnd(p.path);
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
                
                size        = format.size(size);
                
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
        Util.exec.if(WIN32, callback, 
            function(callback) {
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
                    
                    Util.exec(callback);
                });
            });
    }
    
    
     function changeOrder(json) {
        var i, n,
            files   = [],
            dirs    = [], 
            current = [],
            sorted  = [];
        
        n = json.length;
        for (i = 0; i < n; i++) {
            current = json[i];
            
            if (current.size === 'dir')
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
    
    function addSlashToEnd(path) {
        var length, isSlash;
        
        if (path) {
            length  = path.length - 1;
            isSlash = path[length] === '/';
            
            if (!isSlash)
                path += '/';
        }
        
        return path;
    }
    
})();
