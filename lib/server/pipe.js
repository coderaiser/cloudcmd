(function () {
    'use strict';
    
    if (!global.cloudcmd)
        return console.log(
             '# pipe.js'                                        + '\n'  +
             '# -----------'                                    + '\n'  +
             '# Module is part of Cloud Commander,'             + '\n'  +
             '# used for work with stream.'                     + '\n'  +
             '# If you wont to see at work call'                + '\n'  +
             '# pipe.create'                                    + '\n'  +
             '# http://cloudcmd.io'                             + '\n');
    
    var main        = global.cloudcmd.main,
        Util        = main.util,
        fs          = require('fs'),
        zlib        = require('zlib');
    
    exports.create  = create;
    exports.getBody = getBody;
    
   /**
     * create pipe
     * params: {callback, read or from, write or to, gzip}
     * read     - readable stream
     * write    - writable stream
     * to       - name of file to write
     * from     - name of file to read
     * gzip     - should gzip to be used
     * callback - function(error) {}
     *
     * @param params
     * @param callback
     */
    function create(params) {
        var gzip, read, write, isFsWrite,
            p               = params,
            func            = Util.retExec(p.callback),
            options         = {
                bufferSize: 4 * 1024
            };
        
        if (p) {
            if (p.range)
                options = {
                    start       : p.range.start,
                    end         : p.range.end,
                };
            
            read           = p.read    || fs.createReadStream(p.from, options);
            
            if (p.write)
                write      = p.write;
            else {
                write      = fs.createWriteStream(p.to);
                isFsWrite  = true;
            }
            
            if (p.gzip || p.gunzip) {
                if (p.gzip)
                    gzip       = zlib.createGzip();
                else
                    gzip       = zlib.createGunzip();
                
                read.on('error', func);
                read       = read.pipe(gzip);
            }
            
            write.on('error', func);
            read.on('error', func);
            
            Util.ifExec(!isFsWrite, function() {
                read.pipe(write, {
                    end: !p.notEnd
                });
                
                read.on('end', func);
            }, function(callback) {
                write.on('open', callback);
            });
        }
    }
    
    /**
     * get body of readStream
     *
     * @param readStream
     * @param callback
     */
    function getBody(readStream, callback) {
        var body = '';
        
        readStream.on('data', function(chunk) {
            body += chunk;
        });
        
        readStream.on('error', function(error) {
            Util.retExec(callback, error);
        });
        
        readStream.on('end', function() {
            Util.exec(callback, null, body);
        });
    }
})();
