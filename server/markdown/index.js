'use strict';

const {join} = require('path');
const {callbackify} = require('util');

const pullout = require('pullout');
const ponse = require('ponse');
const threadIt = require('thread-it');
const {read} = require('redzip');

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
        return await onGET(request, name, rootDir);
    
    case 'PUT':
        return await onPUT(request);
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
    const stream = await read(fileName);
    const data = await pullout(stream);
    
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

