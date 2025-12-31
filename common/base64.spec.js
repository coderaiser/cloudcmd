'use strict';

const {test, stub} = require('supertape');
const {btoa, atob} = require('./base64');

test('btoa: browser', (t) => {
    const btoaOriginal = globalThis.btoa;
    const btoaStub = stub();
    const str = 'hello';
    
    globalThis.btoa = btoaStub;
    
    btoa(str);
    globalThis.btoa = btoaOriginal;
    
    t.calledWith(btoaStub, [str], 'should call globalThis.btoa');
    t.end();
});

test('btoa: node', (t) => {
    const str = 'hello';
    const expected = 'aGVsbG8=';
    
    const result = btoa(str);
    
    t.equal(result, expected, 'should encode base64');
    t.end();
});

test('atob: browser', (t) => {
    const atobOriginal = globalThis.atob;
    const atobStub = stub();
    
    const str = 'hello';
    
    globalThis.atob = atobStub;
    
    atob(str);
    
    globalThis.atob = atobOriginal;
    
    t.calledWith(atobStub, [str], 'should call globalThis.btoa');
    t.end();
});

test('atob: node', (t) => {
    const str = 'aGVsbG8=';
    const expected = 'hello';
    
    const result = atob(str);
    
    t.equal(result, expected, 'should encode base64');
    t.end();
});
