(function () {
    'use strict';
    
    var Util        = require('../util'),
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
            func            = p.callback,
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
                    gzip    = zlib.createGzip();
                else
                    gzip    = zlib.createGunzip();
                
                on('error', read, func);
                read        = read.pipe(gzip);
            }
            
            on('error', write, func);
            on('error', read, func);
            
            Util.exec.if(!isFsWrite, function() {
                read.pipe(write, {
                    end: !p.notEnd
                });
                
                on('end', read, func);
            }, function(callback) {
                on('open', write, callback);
            });
        }
    }
    
    function on(event, emitter, callback) {
        var isSet,
            listeners   = emitter.listeners(event),
            callbackStr = '' + callback;
        
        isSet   = listeners.some(function(func) {
            return '' + func === callbackStr;
        });
        
        if (!isSet)
            emitter.on(event, callback);
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
        
        readStream.once('error', function(error) {
            Util.exec.ret(callback, error);
        });
        
        readStream.once('end', function() {
            Util.exec(callback, null, body);
        });
    }
})();
