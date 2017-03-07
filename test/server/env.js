'use strict';

const test = require('tape');
const env = require('../../server/env');

test('env: small', (t) => {
    process.env.cloudcmd_hello = 'world';
    t.equal(env('hello'), 'world', 'should parse string from env');
    
    delete process.env.cloudcmd_hello;
    t.end();
});

test('env: big', (t) => {
    process.env.CLOUDCMD_HELLO = 'world';
    t.equal(env('hello'), 'world', 'should parse string from env');
    
    delete process.env.CLOUDCMD_HELLO;
    t.end();
});

test('env: bool', (t) => {
    process.env.cloudcmd_terminal = 'false';
    t.notOk(env.bool('terminal'), 'should return false');
    
    delete process.env.cloudcmd_terminal;
    t.end();
});

test('env: bool', (t) => {
    process.env.cloudcmd_terminal = 'true';
    
    t.ok(env.bool('terminal'), 'should be true');
    
    delete process.env.cloudcmd_terminal;
    t.end();
});

