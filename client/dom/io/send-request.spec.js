'use strict';

const test = require('supertape');
const {_replaceHash} = require('./send-request');

test('cloudcmd: client: io: replaceHash', (t) => {
    const url = '/hello/####world';
    const result = _replaceHash(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected);
    t.end();
});
