'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const vim = require('./vim');

test('vim: no operations', (t) => {
    const result = vim('hello', {});
    
    t.notOk(result);
    t.end();
});

test('vim: ^', (t) => {
    const movePrevious = stub();
    
    vim('^', {
        movePrevious,
    });
    
    const expected = {
        count: Infinity,
        isVisual: false,
        isDelete: false,
    };
    
    t.calledWith(movePrevious, [expected], 'should call movePrevious');
    t.end();
});

test('vim: w', (t) => {
    const moveNext = stub();
    
    vim('w', {
        moveNext,
    });
    
    const expected = {
        count: 1,
        isVisual: false,
        isDelete: false,
    };
    
    t.calledWith(moveNext, [expected], 'should call moveNext');
    t.end();
});

test('vim: b', (t) => {
    const movePrevious = stub();
    
    vim('b', {
        movePrevious,
    });
    
    const expected = {
        count: 1,
        isVisual: false,
        isDelete: false,
    };
    
    t.calledWith(movePrevious, [expected], 'should call movePrevious');
    t.end();
});

