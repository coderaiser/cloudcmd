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
            i, n,
            name,
            readFiles = {},
            doneFunc = function (name, error, data) {
                var msg, status;
                
                done.pop();
                
                if (error) {
                    status = 'error';
                    
                    if (!errors)
                        errors = {};
                    
                    errors[name] = p.error;
                }
                else {
                    status = 'ok';
                    readFiles[name] = data;
                }
                
                name    = path.basename(name);
                msg     = CloudFunc.formatMsg('read', name, status);
                
                Util.log(msg);
                
                if (!done.length)
                    Util.exec(callback, errors, readFiles);
            };
        
        if (Util.isFunction(options)) {
            callback   = options;
            options    = null;
        }
        
        n = files && files.length;
        for (i = 0; i < n; i++) {
            name = files.pop();
            done.push(name);
            
            fs.readFile(name, options, doneFunc.bind(null, name));
        }
    };
    
    object.readPipe     = readPipe;
    
    function readPipe(params) {
        var name, 
            p       = params,
            length  = p.names && p.names.length;
        
        if (!length) {
            p.write.end();
            Util.exec(p.callback);
        } else {
            name = p.dir + p.names.shift();
            
            pipe.create({
                from    : name,
                write   : p.write,
                gzip    : p.gzip,
                notEnd  : true,
                callback: function(error) {
                    if (error)
                        Util.exec(p.callback, error);
                    else
                        readPipe(params);
                }
            });
        }
    }
    
})(this);
