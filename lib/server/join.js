(function() {
    
    var main        = global.cloudcmd.main,
        files       = main.files,
        Util        = main.util,
        CloudFunc   = main.cloudfunc,
        minify      = main.minify,
        zlib        = require('zlib');
    
    module.exports  = join;
    
    function join(before, dir, request, response, callback) {
        var names, i, n, name, minName, stream, check,
            funcs       = [],
            config      = main.config,
            gzip        = zlib.createGzip(),
            isGzip      = main.isGZIP(request),
            path        = main.getPathName(request),
            
            isJoin      = CloudFunc.isJoinURL(path),
            readPipe    = function() {
                main.mainSetHeader({
                    name        : names[0],
                    cache       : config.cache,
                    gzip        : isGzip,
                    request     : request,
                    response    : response
                });
                
                if (!isGzip)
                    stream = response;
                else
                    stream = gzip;
                
                files.readPipe({
                    names       : names,
                    dir         : dir,
                    write       : stream,
                    callback    : function(error) {
                        var errorStr;
                        
                        if (error)
                            if (!response.headersSent)
                                main.sendError({
                                    request     : request,
                                    response    : response,
                                    name        : path
                                }, error);
                            else {
                                Util.log(error);
                                errorStr = error.toString();
                                stream.end(errorStr);
                            }
                    }
                });
                
                /* 
                 * pipe should be setted up after
                 * readPipe called with stream param
                 */
                if (isGzip)
                    gzip.pipe(response);
            };
        
        if (!isJoin) 
            Util.exec(callback);
        else {
            names   = CloudFunc.getJoinArray(path);
            
            if (!before)
                readPipe();
            else
                before(names, readPipe);
        }
        
        return isJoin;
    }
})();
