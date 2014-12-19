(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_LIB     = DIR + '../',
        DIR_ROOT    = __dirname + '/' + DIR_LIB + '../',
        
        fs          = require('fs'),
        
        Util        = require(DIR_LIB + 'util'),
        
        tryRequire  = require(DIR + 'tryRequire'),
        tryOptions  = {log: true, exit: true},
        
        mellow      = tryRequire('mellow', tryOptions),
        pipe        = tryRequire('pipe-io', tryOptions),
        ponse       = tryRequire('ponse', tryOptions),
        
        marked      = tryRequire('marked');
    
    module.exports  = function(name, request, callback) {
        var query,
            method = request.method;
        
        name    = mellow.convertPath(name);
        
        switch(method) {
            case 'GET':
                name    = name.replace('/markdown', '');
                query   = ponse.getQuery(request);
                
                if (query === 'relative')
                    name = DIR_ROOT + name;
                
                fs.readFile(name, 'utf8', function(error, data) {
                    if (error)
                        callback(error);
                    else
                        parse(data, callback);
                });
                break;
            
            case 'PUT':
                
                pipe.getBody(request, function(error, data) {
                    if (error)
                        Util.exec(callback, error);
                    else
                        parse(data, callback);
                });
                break;
        }
    };
    
    function parse(data, callback) {
        var md;
        
        process.nextTick(function() {
            if (marked)
                md = marked(data);
            else
                md = '<pre>' + data + '</pre>';
            
            Util.exec(callback, null, md);
        });
    }
    
})();
