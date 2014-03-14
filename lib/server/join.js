(function() {
    
    var main        = global.cloudcmd.main,
        files       = main.files,
        Util        = main.util,
        CloudFunc   = main.cloudfunc,
        minify      = main.minify,
        zlib        = require('zlib');
    
    module.exports  = join;
    
    function join(before, dir, req, res, callback) {
        var names,
            readFunc    = Util.bind(readPipe, req, res, dir),
            path        = main.getPathName(req),
            isJoin      = CloudFunc.isJoinURL(path);
        
        if (!isJoin) 
            Util.exec(callback);
        else {
            names   = CloudFunc.getJoinArray(path);
            
            readFunc = Util.bind(readFunc, names);
            
            Util.ifExec(!before, readFunc, function(callback) {
                before(names, callback);
            });
        }
        
        return isJoin;
    }
    
    function readPipe(req, res, dir, names) {
        var stream,
            path        = main.getPathName(req),
            gzip        = zlib.createGzip(),
            isGzip      = main.isGZIP(req);
            
        main.mainSetHeader({
            name        : names[0],
            cache       : true,
            gzip        : isGzip,
            request     : req,
            response    : res
        });
        
        stream = isGzip ? gzip : response;
        
        files.readPipe({
            names       : names,
            dir         : dir,
            write       : stream,
            callback    : function(error) {
                var errorStr;
                
                if (error)
                    if (!res.headersSent)
                        main.sendError({
                            request     : req,
                            response    : res,
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
            gzip.pipe(res);
    }
})();
