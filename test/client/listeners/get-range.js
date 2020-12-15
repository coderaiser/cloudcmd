'use strict';

const test = require('supertape');

const dir = '../../../client/listeners';
const getRange = require(`${dir}/get-range`);

test('cloudcmd: client: listeners: getRange: direct', (t) => {
    const expected = ['hello', 'world'];
    const files = [...expected, 'how', 'come'];
    const result = getRange(0, 1, files);
    
    t.deepEqual(result, expected, 'should return range');
    t.end();
});

test('cloudcmd: client: listeners: getRange: reverse', (t) => {
    const expected = ['hello', 'world'];
    const files = [...expected, 'how', 'come'];
    const result = getRange(1, 0, files);
    
    t.deepEqual(result, expected, 'should return range');
    t.end();
});

test('cloudcmd: client: listeners: getRange: one', (t) => {
    const expected = ['hello'];
    const files = [...expected, 'how', 'come'];
    const result = getRange(0, 0, files);
    
    t.deepEqual(result, expected, 'should return range');
    t.end();
});

