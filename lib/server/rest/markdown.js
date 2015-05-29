(function() {
    'use strict';
    
    var DIR         = '../',
        DIR_LIB     = DIR + '../',
        DIR_ROOT    = __dirname + '/' + DIR_LIB + '../',
        
        fs          = require('fs'),
        
        Util        = require(DIR_LIB + 'util'),
        root        = require('root'),
        pipe        = require('pipe-io'),
        ponse       = require('ponse'),
        markdown    = require('markdown-it')();
    
    module.exports  = function(name, request, callback) {
        var query,
            method = request.method;
        
        switch(method) {
            case 'GET':
                name    = name.replace('/markdown', '');
                query   = ponse.getQuery(request);
                
                if (query === 'relative')
                    name = DIR_ROOT + name;
                else
                    name = root(name);
                
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
            md = markdown.render(data);
            
            callback(null, md);
        });
    }
    
})();
