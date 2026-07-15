import process from 'node:process';
import {test} from 'supertape';
import * as env from '../../server/env.js';

test('env: small', (t) => {
    process.env.cloudcmd_hello = 'world';
    
    delete process.env.cloudcmd_hello;
    
    t.equal(env.parse('hello'), 'world', 'should parse string from env');
    t.end();
});

test('env: big', (t) => {
    process.env.CLOUDCMD_HELLO = 'world';
    
    delete process.env.CLOUDCMD_HELLO;
    
    t.equal(env.parse('hello'), 'world', 'should parse string from env');
    t.end();
});

test('env: bool: false', (t) => {
    process.env.cloudcmd_terminal = 'false';
    
    delete process.env.cloudcmd_terminal;
    
    t.notOk(env.bool('terminal'), 'should return false');
    t.end();
});

test('env: bool: true', (t) => {
    process.env.cloudcmd_terminal = 'true';
    
    delete process.env.cloudcmd_terminal;
    
    t.ok(env.bool('terminal'), 'should be true');
    t.end();
});

test('env: bool: undefined', (t) => {
    const {cloudcmd_terminal} = process.env;
    
    process.env.cloudcmd_terminal = undefined;
    process.env.cloudcmd_terminal = cloudcmd_terminal;
    
    const result = env.bool('terminal');
    
    t.notOk(result);
    t.end();
});
