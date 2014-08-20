(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_LIB     = DIR + '../',
        
        fs          = require('fs'),
        
        Util        = require(DIR_LIB + 'util'),
        
        marked      = tryRequire('marked'),
        
        pipe        = require(DIR + 'pipe'),
        mellow      = require(DIR + 'mellow'),
        ponse       = require(DIR + 'ponse');
    
    exports.operate = operate;
    
    function operate(name, request, callback) {
        var query,
            method = request.method;
        
        name    = mellow.convertPath(name);
        
        switch(method) {
            case 'GET':
                name    = Util.rmStrOnce(name, '/markdown');
                query   = ponse.getQuery(request);
                
                if (query === 'relative')
                    name = DIR + name;
                
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
    }
    
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
    
    function tryRequire(name) {
        var module;
        
        Util.exec.try(function() {
            module = require(name);
        });
        
        return module;
    }
    
})();
