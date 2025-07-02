'use strict';

const {test, stub} = require('supertape');

const {btoa, atob} = require('./base64');

test('btoa: browser', (t) => {
    const btoaOriginal = global.btoa;
    const btoaStub = stub();
    const str = 'hello';
    
    global.btoa = btoaStub;
    
    btoa(str);
    global.btoa = btoaOriginal;
    
    t.calledWith(btoaStub, [str], 'should call global.btoa');
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
    const atobOriginal = global.atob;
    const atobStub = stub();
    
    const str = 'hello';
    
    global.atob = atobStub;
    
    atob(str);
    
    global.atob = atobOriginal;
    
    t.calledWith(atobStub, [str], 'should call global.btoa');
    t.end();
});

test('atob: node', (t) => {
    const str = 'aGVsbG8=';
    const expected = 'hello';
    
    const result = atob(str);
    
    t.equal(result, expected, 'should encode base64');
    t.end();
});
