'use strict';

const DIR_ROOT = __dirname + '/../';
const fs = require('fs');
const {
    callbackify,
    promisify,
} = require('util');

const pullout = require('pullout');
const ponse = require('ponse');
const markdown = require('markdown-it')();

const readFile = promisify(fs.readFile);

const root = require('./root');

module.exports = callbackify(async (name, rootDir, request) => {
    check(name, request);
    
    const {method} = request;
    
    switch(method) {
    case 'GET':
        return onGET(request, name, rootDir);
    
    case 'PUT':
        return onPUT(request);
    }
});

function parseName(query, name, rootDir) {
    const shortName = name.replace('/markdown', '');
    
    if (query === 'relative')
        return DIR_ROOT + shortName;
    
    return root(shortName, rootDir);
}

async function onGET(request, name, root) {
    const query = ponse.getQuery(request);
    const fileName = parseName(query, name, root);
    const data = await readFile(fileName, 'utf8');
    
    return parse(data);
}

async function onPUT(request) {
    const data = await pullout(request);
    
    return parse(data);
}

const parse = promisify((data, callback) => {
    process.nextTick(() => {
        const md = markdown.render(data);
        
        callback(null, md);
    });
});

function check(name, request) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (!request)
        throw Error('request could not be empty!');
}

