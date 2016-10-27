'use strict';

var DIR         = './',
    DIR_LIB     = '../',
    DIR_ROOT    = __dirname + '/' + DIR_LIB + '../',
    
    fs          = require('fs'),
    
    root        = require(DIR + 'root'),
    pipe        = require('pipe-io'),
    ponse       = require('ponse'),
    markdown    = require('markdown-it')();

function check(name, request, callback) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    else if (!request)
        throw Error('request could not be empty!');
    
    else if (typeof callback !== 'function')
        throw Error('callback should be function!');
}

module.exports  = function(name, request, callback) {
    var query,
        method = request.method;
    
    check(name, request, callback);
    
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
                    callback(error);
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

