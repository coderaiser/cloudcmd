import {readFile} from 'fs/promises';
import {join, dirname} from 'path';
import {callbackify} from 'util';
import {fileURLToPath} from 'url';

import pullout from 'pullout';
import ponse from 'ponse';
import threadIt from 'thread-it';

const __dirname = dirname(fileURLToPath(import.meta.url));

const parse = threadIt(join(__dirname, 'worker.cjs'));

import root from '../root.js';

threadIt.init();

// warm up
parse('');

const DIR_ROOT = __dirname + '/../../';

export default callbackify(async (name, rootDir, request) => {
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

