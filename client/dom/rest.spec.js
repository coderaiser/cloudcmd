'use strict';

const autoGlobals = require('auto-globals');
const tape = autoGlobals(require('supertape'));

const test = autoGlobals(tape);
const rest = require('./rest');

test('cloudcmd: client: rest: replaceHash', (t) => {
    const {_replaceHash} = rest;
    const url = '/hello/####world';
    const result = _replaceHash(url);
    const expected = '/hello/%23%23%23%23world';
    
    t.equal(result, expected, 'should equal');
    t.end();
});
