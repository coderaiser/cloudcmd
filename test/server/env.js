'use strict';

const test = require('supertape');
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

test('env: bool: false', (t) => {
    process.env.cloudcmd_terminal = 'false';
    t.equal(env.bool('terminal'), false, 'should return false');
    
    delete process.env.cloudcmd_terminal;
    t.end();
});

test('env: bool: true', (t) => {
    process.env.cloudcmd_terminal = 'true';
    
    t.equal(env.bool('terminal'), true, 'should be true');
    
    delete process.env.cloudcmd_terminal;
    t.end();
});

test('env: bool: undefined', (t) => {
    const {cloudcmd_terminal} = process.env;
    process.env.cloudcmd_terminal = undefined;
    
    t.equal(env.bool('terminal'), undefined, 'should be undefined');
    
    process.env.cloudcmd_terminal = cloudcmd_terminal;
    t.end();
});

