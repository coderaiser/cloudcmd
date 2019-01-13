'use strict';

const test = require('supertape');
const entity = require('../../common/entity');

test('cloudcmd: entity: encode', (t) => {
    const result = entity.encode('<hello> ');
    const expected = '&lt;hello&gt;&nbsp;';
    
    t.equal(result, expected, 'should encode entity');
    t.end();
});

test('cloudcmd: entity: decode', (t) => {
    const result = entity.decode('&lt;hello&gt;&nbsp;');
    const expected = '<hello> ';
    
    t.equal(result, expected, 'should decode entity');
    t.end();
});

test('cloudcmd: entity: encode', (t) => {
    const result = entity.encode('"hello"');
    const expected = '&quot;hello&quot;';
    
    t.equal(result, expected, 'should encode entity');
    t.end();
});

