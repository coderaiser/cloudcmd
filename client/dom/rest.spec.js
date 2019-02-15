'use strict';

const test = require('supertape');
const rest = require('./rest');

test('cloudcmd: client: rest: replaceHash', (t) => {
    const {_replaceHash} = rest;
    const url = '/hello/####world';
    const result = _replaceHash(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

