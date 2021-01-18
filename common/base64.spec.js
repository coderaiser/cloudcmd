'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const {btoa, atob} = require('./base64');

test('btoa: browser', (t) => {
    const btoaOriginal = global.btoa;
    const str = 'hello';
    
    global.btoa = stub();
    
    btoa(str);
    
    t.calledWith(global.btoa, [str], 'should call global.btoa');
    t.end();
    
    global.btoa = btoaOriginal;
});

test('btoa: node', (t) => {
    const str = 'hello';
    const expected = 'aGVsbG8=';
    
    const result = btoa(str);
    
    t.equal(result, expected, 'should encode base64');
    t.end();
});

test('atob: browser', (t) => {
    const atobOriginal = global.atob;
    const str = 'hello';
    
    global.atob = stub();
    
    atob(str);
    
    t.calledWith(global.atob, [str], 'should call global.btoa');
    t.end();
    
    global.atob = atobOriginal;
});

test('atob: node', (t) => {
    const str = 'aGVsbG8=';
    const expected = 'hello';
    
    const result = atob(str);
    
    t.equal(result, expected, 'should encode base64');
    t.end();
});

