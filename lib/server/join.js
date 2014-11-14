(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_SERVER  = DIR + 'server/',
        files       = require(DIR_SERVER + 'files'),
        ponse       = require(DIR_SERVER + 'ponse'),
        
        Minify      = require(DIR_SERVER + 'minify'),
        
        Util        = require(DIR + 'util'),
        
        path        = require('path'),
        zlib        = require('zlib'),
        
        FILE        = __dirname + '/../join.js',
        
        PREFIX      = '/join';
    
    module.exports  = function(options) {
        return join.bind(null, options);
    };
    
    function join(options, req, res, next) {
        var prefix, dir,
            names,
            isMinify,
            isFunc,
            exec        = Util.exec,
            read        = exec.with(readPipe, req, res),
            path        = ponse.getPathName(req),
            regExp      = new RegExp('^' + PREFIX + '(:|/)'),
            regExpFile  = new RegExp('^' + PREFIX + '/join.js$'),
            isJoin      = regExp.test(path),
            isJoinFile  = regExpFile.test(path);
        
        if (!options)
            options = {};
        
        isFunc  = Util.type.function(options.minify);
        
        if (isFunc)
            isMinify = options.minify();
        else
            isMinify = options.minify;
        
        if (!isJoin) {
            next();
        } else {
            prefix  = options.prefix || PREFIX;
            dir     = options.dir || __dirname + '/../../';
            
            if (isJoinFile)
                names = [FILE];
            else
                names = parse(prefix, dir, path);
            
            exec.if(!isMinify, function(error, namesObj) {
                var is      = Util.type.object(namesObj);
                
                if (is)
                    names = names.map(function(key) {
                        return namesObj[key] || key;
                    });
                
                read(names);
            }, function(callback) {
                uglify(names, callback);
            });
        }
        
        return isJoin;
    }
    
    function parse(prefix, dir, url) {
        var names,
            isStr    = typeof url === 'string';
        
        if (!isStr)
            throw(Error('url must be string!'));
            
        names = url.replace(prefix + ':', '')
                   .split(':')
                   .map(function(name) {
                        return path.join(dir, name);
                   });
        
        return names;
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
                    ponse.sendError(msg, {
                        name        : path,
                        gzip        : isGzip,
                        request     : req,
                        response    : res
                    });
            }
        });
        
        /* 
         * pipe should be setted up after
         * readPipe called with stream param
         */
        if (isGzip)
            gzip.pipe(res);
    }
    
    function minify(name, callback) {
        Minify(name, 'name', function(error, name) {
            callback(null, name);
        });
    }
    
    function retMinify(name) {
        return minify.bind(null, name);
    }
    
    function uglify(names, callback) {
        var funcs = {};
        
        names.forEach(function(name) {
            funcs[name] = retMinify(name);
        });
        
        Util.exec.parallel(funcs, callback);
    }
})();
