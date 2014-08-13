(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        files       = require(DIR_SERVER + 'files'),
        ponse       = require(DIR_SERVER + 'ponse'),
        
        Util        = require(DIR + 'util'),
        CloudFunc   = require(DIR + 'cloudfunc'),
        zlib        = require('zlib');
    
    module.exports  = function(before) {
        return join.bind(null, before);
    };
    
    function join(before, req, res, next) {
        var names,
            exec        = Util.exec,
            readFunc    = exec.with(readPipe, req, res),
            path        = ponse.getPathName(req),
            regExp      = new RegExp('^/join/'),
            isJoin      = path.match(regExp);
        
        if (!isJoin) {
            next();
        } else {
            names   = CloudFunc.getJoinArray(path);
            
            exec.if(!before, readFunc, function(callback) {
                before(names, callback);
            });
        }
        
        return isJoin;
    }
    
    function readPipe(req, res, names) {
        var stream,
            path        = ponse.getPathName(req),
            gzip        = zlib.createGzip(),
            isGzip      = ponse.isGZIP(req);
            
        ponse.setHeader({
            name        : names[0],
            cache       : true,
            gzip        : isGzip,
            request     : req,
            response    : res
        });
        
        stream = isGzip ? gzip : res;
        
        files.readPipe(names, stream, function(error) {
            var msg = '';
            
            if (error) {
                Util.log(error);
                msg = error.message;
                
                if (res.headersSent)
                    stream.end(msg);
                else
                    ponse.send.error(msg, {
                        request     : req,
                        response    : res,
                        name        : path
                    });
            }
        }
        );
        
        /* 
         * pipe should be setted up after
         * readPipe called with stream param
         */
        if (isGzip)
            gzip.pipe(res);
    }
})();
