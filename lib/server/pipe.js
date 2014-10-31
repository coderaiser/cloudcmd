(function () {
    'use strict';
    
    var fs          = require('fs'),
        zlib        = require('zlib'),
        
        Util        = require('../util'),
        type        = Util.type;
    
    module.exports  = create;
    module.exports.getBody = getBody;
    
   /**
     * create pipe
     * 
     * @param read     - readable stream
     * @param write    - writable stream
     * 
     * @param options {
     *      gzip
     *      ungzip
     *      notEnd
     * }
     * 
     * @param callback - function(error) {}
     */
    function create(read, write, options, callback) {
        var gzip, isFsWrite,
            isStrRead       = type.string(read),
            isStrWrite      = type.string(write),
            isFunc          = type.function(options),
            o               = {},
            optionsRead     = {
                bufferSize: 4 * 1024
            };
        
        Util.checkArgs(arguments, ['read', 'write', 'callback']);
        
        if (isFunc)
            callback    = options;
        else 
            o           = options;
        
        if (options.range)
            Util.extend(optionsRead, {
                start   : o.range.start,
                end     : o.range.end,
            });
            
        
        if (isStrRead)
            read        = fs.createReadStream(read, optionsRead);
        
        if (isStrWrite) {
            write       = fs.createWriteStream(write);
            isFsWrite   = true;
        }
        
        if (o.gzip || o.gunzip) {
            if (o.gzip)
                gzip    = zlib.createGzip();
            else
                gzip    = zlib.createGunzip();
            
            on('error', read, callback);
            read        = read.pipe(gzip);
        }
        
        on('error', write, callback);
        on('error', read, callback);
        
        Util.exec.if(!isFsWrite, function() {
            read.pipe(write, {
                end: !o.notEnd
            });
            
            on('end', read, callback);
        }, function(callback) {
            on('open', write, callback);
        });
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
        var sended, body = '';
        
        Util.checkArgs(arguments, ['readStream', 'callback']);
        
        readStream.on('data', function(chunk) {
            body += chunk;
        });
        
        readStream.once('error', function(error) {
            sended = true;
            callback(error);
        });
        
        readStream.once('end', function() {
            if (!sended)
                callback(null, body);
        });
    }
})();
