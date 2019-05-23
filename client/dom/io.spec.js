'use strict';

const test = require('supertape');
const io = require('./io');

test('cloudcmd: client: io: replaceHash', (t) => {
    const {_replaceHash} = io;
    const url = '/hello/####world';
    const result = _replaceHash(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

