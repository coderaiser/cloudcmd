import test from 'supertape';
import {getDOM} from './globals.fixture.js';
import {_next, _previous, find, findNext, findPrevious} from './find.js';

globalThis.DOM = getDOM();

test('cloudcmd: client: vim: _next', (t) => {
    const result = _next(1, 2);
    
    t.notOk(result, 'should return 0');
    t.end();
});

test('cloudcmd: client: vim: _next: increment', (t) => {
    const result = _next(0, 2);
    
    t.equal(result, 1, 'should return 1');
    t.end();
});

test('cloudcmd: client: vim: _previous', (t) => {
    const result = _previous(0, 2);
    
    t.equal(result, 1, 'should return 1');
    t.end();
});

test('cloudcmd: client: vim: _previous: decrement', (t) => {
    const result = _previous(1, 2);
    
    t.equal(result, 0, 'should return 0');
    t.end();
});

test('cloudcmd: client: vim: findNext: after find', (t) => {
    find('a', ['alpha', 'beta', 'apple']);
    const result = findNext();
    
    t.equal(result, 'beta', 'should return next found name');
    t.end();
});

test('cloudcmd: client: vim: findPrevious: after find', (t) => {
    find('a', ['alpha', 'beta', 'apple']);
    const result = findPrevious();
    
    t.equal(result, 'apple', 'should return previous found name');
    t.end();
});
