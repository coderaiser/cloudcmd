'use strict';

const test = require('tape');
const rest = require('../../server/rest');
const {
    _formatMsg,
} = rest;

test('rest: formatMsg', (t) => {
    const result = _formatMsg('hello', 'world');
    
    t.equal(result, 'hello: ok("world")');
    t.end();
});

test('rest: formatMsg: json', (t) => {
    const result = _formatMsg('hello', {
        name: 'world',
    });
    
    t.equal(result, 'hello: ok("{"name":"world"}")');
    t.end();
});

