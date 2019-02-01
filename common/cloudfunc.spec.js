'use strict';

const test = require('supertape');
const cloudfunc = require('./cloudfunc');
const {_getSize} = cloudfunc;

test('cloudfunc: getSize: dir', (t) => {
    const type = 'directory';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;dir&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: link: dir', (t) => {
    const type = 'directory-link';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;link&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: link: file', (t) => {
    const type = 'file-link';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;link&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: file', (t) => {
    const type = 'file';
    const size = '100.00kb';
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '100.00kb';
    
    t.equal(result, expected, 'should equal');
    t.end();
});
