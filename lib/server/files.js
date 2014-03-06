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
        path        = main.path,
        pipe        = main.pipe,
        CloudFunc   = main.cloudfunc,
        Util        = main.util;
    
    object.read     = function(files, options, callback) {
        var done = [],
            errors,
            name,
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
            
        console.log(p.names);
        if (p.names) {
            names   = p.names.slice();
            lenght  = p.names.length;
        }
        
        if (!lenght) {
            p.write.end();
            Util.exec(p.callback);
        } else {
            name = p.dir + names.shift();
            
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
                            dir     : p.dir,
                            names   : names,
                            write   : p.write,
                            gzip    : p.gzip
                        });
                }
            });
        }
    }
    
})(this);
