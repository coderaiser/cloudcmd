'use strict';

const DIR_ROOT = __dirname + '/../../';
const fs = require('fs');

const pullout = require('pullout/legacy');
const ponse = require('ponse');
const markdown = require('markdown-it')();

const root = require('./root');

module.exports  = (name, request, callback) => {
    const method = request.method;
    const query = ponse.getQuery(request);
    
    check(name, request, callback);
    
    switch(method) {
    case 'GET':
        name = name.replace('/markdown', '');
            
        if (query === 'relative')
            name = DIR_ROOT + name;
        else
                name = root(name);
            
        fs.readFile(name, 'utf8', (error, data) => {
            if (error)
                return callback(error);
                
            parse(data, callback);
        });
        break;
        
    case 'PUT':
        pullout(request, 'string', (error, data) => {
            if (error)
                return callback(error);
               
            parse(data, callback);
        });
        break;
    }
};

function parse(data, callback) {
    process.nextTick(() => {
        const md = markdown.render(data);
        
        callback(null, md);
    });
}

function check(name, request, callback) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (!request)
        throw Error('request could not be empty!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be function!');
}


