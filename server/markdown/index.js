'use strict';

const {readFile} = require('fs').promises;
const {join} = require('path');
const {callbackify} = require('util');

const pullout = require('pullout');
const ponse = require('ponse');
const threadIt = require('thread-it');

const parse = threadIt(join(__dirname, 'worker'));

const root = require('../root');

threadIt.init();

// warm up
parse('');

const DIR_ROOT = __dirname + '/../../';

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

function check(name, request) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (!request)
        throw Error('request could not be empty!');
}

