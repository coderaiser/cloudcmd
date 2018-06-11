'use strict';

const test = require('tape');
const getNextCurrentName = require('./get-next-current-name');

test('get-next-current-name', (t) => {
    const names = [
        '..',
        'hello',
        '1',
        '2',
    ];
    
    const removedNames = [
        '1'
    ];
    
    const name = getNextCurrentName('hello', names, removedNames);
    
    t.equal(name, 'hello', 'should equal');
    t.end();
});

test('get-next-current-name: all files removed', (t) => {
    const names = [
        '..',
        'hello',
        '1',
        '2',
    ];
    
    const removedNames = [
        '1',
        '2',
        'hello',
    ];
    
    const name = getNextCurrentName('2', names, removedNames);
    
    t.equal(name, '..', 'should equal');
    t.end();
});

