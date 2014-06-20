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
        pipe        = require(DIR + 'pipe'),
        ncp         = require(DIR + 'ncp'),
        
        rimraf      = tryRequire('rimraf'),
        mkdir       = tryRequire('mkdirp') || fs.mkdir;
    
    exports.create  = function(path, type, callback) {
        Util.checkArgs(arguments, ['path', 'callback']);
        
        mkdir(path, callback);
    };
    
    exports.read    = function(path, type, callback) {
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
            
        default:
            commander.getDirContent(path, callback);
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
        else if (type instanceof Buffer)
            type = 'string';
        
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
            fs.unlink(path, function(error) {
                var isDir = error && error.code === 'EISDIR';
                
                if (isDir)
                    fs.rmdir(path, callback);
                else
                    callback(error);
            });
    };
    
    exports.move    = function(from, to, callback) {
        fs.rename(from, to, function(error) {
            var isExDev = error && error.code === 'EXDEV';
            
            if (ncp && rimraf && isExDev)
                ncp(from, to, function() {
                    rimraf(from, callback);
                });
            else
                callback(error);
        });
    };
    
    exports.copy    = function(from, to, type, callback) {
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
