'use strict';

const test = require('supertape');

const dir = '../../../client/listeners';
const getIndex = require(`${dir}/get-index`);

test('cloudcmd: client: listeners: getIndex: not found', (t) => {
    const array = ['hello'];
    
    t.equal(getIndex(array, 'world'), 0, 'should return index');
    t.end();
});

test('cloudcmd: client: listeners: getIndex: found', (t) => {
    const array = ['hello', 'world'];
    
    t.equal(getIndex(array, 'world'), 1, 'should return index');
    t.end();
});

