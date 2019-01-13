'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const btoa = require('../../common/btoa');

test('btoa: browser', (t) => {
    const btoaOriginal = global.btoa;
    const str = 'hello';
    
    global.btoa = stub();
    
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

