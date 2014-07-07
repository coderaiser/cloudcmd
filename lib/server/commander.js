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
        Util.checkArgs(arguments, ['path', 'callback'])
            .checkType('path', path, 'string')
            .checkType('callback', callback, 'function');
        
        fs.readdir(path, function(error, names) {
            if (error)
                callback(error);
            else
                getAllStats(path, names, callback);
        });
    };
    
    
    /**
     * @param path
     * @param names
     */
    function getAllStats(path, names, callback) {
        var length  = names.length,
            funcs   = names.length ? {} : [],
            dir     = format.addSlashToEnd(path);
        
        if (!length)
            funcs.push(Util.exec);
        else
            names.forEach(function(name) {
                var path    = dir + name;
                
                funcs[name] = Util.exec.with(getStat, name, path);
            });
        
        Util.exec.parallel(funcs, function(error, files) {
            fillJSON(dir, files || {}, callback);
        });
    }
    
    function getStat(name, path, callback) {
        fs.lstat(path, function(error, data) {
            callback(null, data || {
                'mode'          : 0,
                'size'          : 0,
                'isDirectory'   : Util.retFalse
            });
        });
    }
    
    
    function parseStats(stats) {
        var files;
        
        Util.checkArgs(arguments, ['stats']);
        
        files = Object.keys(stats).map(function(name) {
            var file, isDir, size, mode, modeStr,
                stat    = stats[name],
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
    function fillJSON(path, stats, callback) {
        var files,
            
            json    = {
                path    : '',
                files   : []
            };
        
        Util.checkArgs(arguments, ['params']);
        
        files       = parseStats(stats);
        json.files  = changeOrder(files);
        json.path   = format.addSlashToEnd(path);
        
        changeUIDToName(json, function(error) {
            callback(error, json);
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
