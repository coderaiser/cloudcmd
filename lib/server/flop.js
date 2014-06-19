/*
 * FLOP - FiLe OPerations
 */

(function() {
    'use strict';
    
    var fs          = require('fs'),
        DIR         = './',
        
        Util        = require(DIR + '../util'),
        
        dir         = require(DIR + 'dir'),
        commander   = require(DIR + 'commander'),
        time        = require(DIR + 'time'),
        Hash        = require(DIR + 'hash'),
        pipe        = require(DIR + 'pipe'),
        
        ncp         = tryRequire('ncp'),
        rimraf      = tryRequire('rimraf'),
        mkdir       = tryRequire('mkdirp') || fs.mkdir;
    
    exports.create  = function(path, type, callback) {
        Util.checkArgs(arguments, ['path', 'callback']);
        
        if (!callback) {
            callback    = type;
            type        = 'file';
        }
        
        if (!type)
            type        = 'file';
        
        switch(type) {
        case 'file':
            fs.writeFile(path, '', callback);
            break;
        
        case 'dir':
            mkdir(path, callback);
            break;
        }
    };
    
    exports.read    = function(path, type, callback) {
        var hash, error;
        
        Util.checkArgs(arguments, ['path', 'callback']);
        
        if (!callback)
            callback = type;
        
        switch (type) {
        case 'size':
            dir.getSize(path, callback);
            break;
            
        case 'time':
            time.get(path, function(error, time) {
                var timeStr;
                
                if (!error)
                    timeStr = time.toString();
                
                callback(error, timeStr);
            });
            break;
            
        case 'hash':
            hash = Hash.create();
            
            if (!hash) {
                error   = 'hash: not suported, try update node';
                callback(new Error(error));
            } else
                pipe.create(path, hash, function (error) {
                    var hex;
                    
                    if (!error)
                        hex = hash.get();
                    
                    callback(error, hex);
                });
            break;
        
        default:
            dir.isDir(path, function(error, isDir) {
                var getDirContent   = commander.getDirContent;
                
                if (isDir && !error)
                    getDirContent(path, callback);
                else
                    callback(error, null, !isDir);
            });
            break;
        }
    };
    
    exports.write  = function(path, data, option, callback) {
        var optionsPipe,
            type = Util.getType(data);
        
        Util.checkArgs(arguments, ['path', 'data', 'callback']);
        
        if (!callback)
            callback    = option;
        
        if (!type)
            type        = '';
        
        switch(type) {
        case 'string':
            fs.writeFile(path, data, callback);
            break;
        
        case 'object':
            optionsPipe = {
                gunzip  : option === 'unzip',
                gzip    : option === 'zip'
            };
            
            pipe.create(data, path, optionsPipe, callback);
            break;
        }
    };
    
    exports.delete  = function(path, callback) {
        if (rimraf)
            rimraf(path, callback);
        else
            dir.isDir(path, function(error, isDir) {
                if (error)
                    callback(error);
                else if (isDir)
                    fs.rmdir(path, callback);
                else
                    fs.unlink(path, callback);
            });
    };
    
    exports.mv      = function(from, to, callback) {
        dir.isDir(from, function(error, isDir) {
            if (error)
                callback(error);
            else if (isDir && ncp && rimraf)
                ncp(from, to, function() {
                    rimraf(from, callback);
                });
            else
                fs.rename(from, to, callback);
            });
    };
    
    exports.cp      = function(from, to, type, callback) {
        var options;
        
        if (!callback) {
            callback    = type;
            type        = null;
        }
        
        switch(type) {
        default:
            (ncp || pipe.create)(from, to, callback);
            break;
        
        case 'zip':
            options = {
                gzip    : true
            };
            
            pipe.create(from, to, options, callback);
            break;
        
        case 'unzip':
            options = {
                gunzip  : true
            };
            
            pipe.create(from, to, options, callback);
            break;
        }
    };
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
})();
