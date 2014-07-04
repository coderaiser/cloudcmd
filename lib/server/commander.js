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
        format              = require(DIR           + 'format'),
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
    function readDir(params, error, names) {
        var n, stats, filesData, fill, fileParams,
            p               = params,
            dirPath         = format.addSlashToEnd(p.path);
        
        if (error)
             Util.exec(p.callback, error);
        else {
            /* Получаем информацию о файлах */
            n           = names.length,
            stats       = {},
            
            filesData   = {
                names       : names,
                stats       : stats,
                callback    : p.callback,
                path        : p.path
            },
            
            fill        = fillJSON.bind(null, filesData);
            
            if (!n)
                fillJSON(filesData);
            else
                names.forEach(function(name) {
                    fileParams  =  {
                        callback    : fill,
                        count       : n,
                        name        : name,
                        stats       : stats,
                    };
                    
                    fs.lstat(dirPath + name, onStat.bind(null, fileParams));
                });
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
    
    function parseStats(names, stats) {
        var files;
        
        Util.checkArgs(arguments, ['names', 'stats']);
        
        files = names.map(function(name) {
            var file, isDir, size, owner, mode, modeStr,
                stat    = stats[name];
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
                'size'  : format.size(size),
                'owner' : owner,
                'mode'  : format.permissions.symbolic(mode)
            };
            
            return file;
        });
        
        return files;
    }
    
    /**
     * Function fill JSON by file stats
     *
     * @param params - { files, stats, path }
     */
    function fillJSON(params) {
        var p       = params,
            files,
            
            json    = {
                path    : '',
                files   : []
            };
        
        Util.checkArgs(arguments, ['params']);
        
        files       = parseStats(p.names, p.stats);
        json.files  = changeOrder(files);
        json.path   = format.addSlashToEnd(p.path);
        
        changeUIDToName(json, function(error) {
            p.callback(error, json);
        });
    }
    
    function changeUIDToName(json, callback) {
        if (WIN32)
            callback();
        else
            users.getNames(function(error, names) {
                var files = json.files;
                
                if (error)
                    callback(error);
                else
                    files.forEach(function(file) {
                        var owner   = file.owner;
                            owner   = names[owner];
                    
                        if (owner)
                            file.owner   = owner;
                    });
                
                callback();
            });
    }
    
    
    function changeOrder(json) {
        var files   = [],
            dirs    = [],
            sorted  = [];
        
        json.forEach(function(current) {
            if (current.size === 'dir')
                dirs.push(current);
            else 
                files.push(current);
        });
        
        sorted = dirs.concat(files);
        
        return sorted;
    }
    
})();
