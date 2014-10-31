(function(object) {
    'use strict';
    
    var fs          = require('fs'),
        pipe        = require('./pipe'),
        Util        = require('../util');
    
    object.read     = function(files, options, callback) {
        var done        = [],
            isDone      = false,
            noOptions   = Util.type.function(options),
            readFiles   = {},
            doneFunc    = function (name, error, data) {
                done.pop();
                
                if (error) 
                    done = [];
                else
                    readFiles[name] = data;
                
                if (!done.length && !isDone) {
                    isDone  = true;
                    callback(error, readFiles);
                }
            };
        
        Util.checkArgs(arguments, ['files', 'callback']);
        
        if (noOptions) {
            callback   = options;
            options    = null;
        }
        
        done = files.map(function(name) {
            fs.readFile(name, options, doneFunc.bind(null, name));
            return name;
        });
    };
    
    object.readPipe     = readPipe;
    
    function readPipe(names, write, options, callback) {
        var name, lenght;
        
        if (!callback) {
            callback    = options;
            options     = {
                gzip    : false
            };
        }
        
        options.notEnd  = true;
        
        if (names) {
            lenght  = names.length;
            names   = names.slice();
        }
        
        if (!lenght) {
            write.end();
            callback();
        } else {
            name = names.shift();
            
            pipe(name, write, options, function(error) {
                if (error)
                    callback(error);
                else
                    readPipe(names, write, options, callback);
            });
        }
    }
    
})(this);
