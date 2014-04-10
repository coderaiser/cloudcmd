(function(object) {
    'use strict';
    
    if(!global.cloudcmd)
        return console.log(
            '# files.js'                                        + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for reading a couple files.'                + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
    
    var main        = global.cloudcmd.main,
        fs          = main.fs,
        pipe        = main.pipe,
        Util        = main.util;
    
    object.read     = function(files, options, callback) {
        var done = [],
            errors,
            readFiles = {},
            doneFunc = function (name, error, data) {
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
        
        if (Util.isFunction(options)) {
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
            p       = params;
        
        if (p.names) {
            names   = p.names.slice();
            lenght  = p.names.length;
        }
        
        if (!lenght) {
            p.write.end();
            Util.exec(p.callback);
        } else {
            name = names.shift();
            
            pipe.create({
                from    : name,
                write   : p.write,
                gzip    : p.gzip,
                notEnd  : true,
                callback: function(error) {
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
                }
            });
        }
    }
    
})(this);
