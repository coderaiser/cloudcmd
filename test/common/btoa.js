'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const btoa = require('../../common/btoa');

test('btoa: browser', (t) => {
    const btoaOriginal = global.btoa;
    const str = 'hello';
    
    global.btoa = sinon.stub();
    
    btoa(str);
    
    t.ok(global.btoa.calledWith(str), 'should call global.btoa');
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

