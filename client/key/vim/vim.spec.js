import {test, stub} from 'supertape';
import vim from './vim.js';

test('vim: no operations', (t) => {
    const result = vim('hello', {});
    
    t.notOk(result);
    t.end();
});

test('vim: space', (t) => {
    const moveNext = stub();
    
    vim(' ');
    vim('j', {
        moveNext,
    });
    
    const args = [{
        count: 1,
        isDelete: false,
        isVisual: false,
    }];
    
    t.calledWith(moveNext, args);
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
