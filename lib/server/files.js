(function(object) {
    'use strict';
    
    var fs          = require('fs'),
        pipe        = require('./pipe'),
        Util        = require('../util');
    
    object.read     = function(files, options, callback) {
        var errors,
            done        = [],
            noOptions   = Util.isFunction(options),
            readFiles   = {},
            doneFunc    = function (name, error, data) {
                done.pop();
                
                if (!error) 
                    readFiles[name] = data;
                else {
                    if (!errors)
                        errors = {};
                    
                    errors[name] = error;
                }
                
                if (!done.length)
                    Util.exec(callback, errors, readFiles);
            };
        
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
    
    function readPipe(params) {
        var name, names, lenght,
            p       = params,
            options = {
                gzip : p.gzip,
                notEnd  : true
            };
        
        if (p.names) {
            names   = p.names.slice();
            lenght  = p.names.length;
        }
        
        if (!lenght) {
            p.write.end();
            Util.exec(p.callback);
        } else {
            name = names.shift();
            
            pipe.create(name, p.write, options, function(error) {
                if (error)
                    Util.exec(p.callback, error);
                else
                    readPipe({
                        dir         : p.dir,
                        names       : names,
                        write       : p.write,
                        gzip        : p.gzip,
                        callback    : p.callback
                    });
            });
        }
    }
    
})(this);
