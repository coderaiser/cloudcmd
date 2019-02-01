'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const dir = './';

const {getDOM} = require('./globals.fixture');

global.DOM = getDOM();

const {
    find,
    findNext,
    findPrevious,
    _next,
    _previous,
} = require(dir + 'find');

test('cloudcmd: client: vim: find', (t) => {
    const {DOM} = global;
    const setCurrentByName = stub();
    
    DOM.setCurrentByName = setCurrentByName;
    DOM.Dialog.prompt = Promise.resolve.bind(Promise);
    
    find('');
    
    t.ok(setCurrentByName.calledWith(undefined), 'should call setCurrentByName');
    t.end();
});

test('cloudcmd: client: vim: findNext', (t) => {
    const {DOM} = global;
    const setCurrentByName = stub();
    DOM.setCurrentByName = setCurrentByName;
    
    findNext();
    
    t.ok(setCurrentByName.calledWith(undefined), 'should call setCurrentByName');
    t.end();
});

test('cloudcmd: client: vim: findPrevious', (t) => {
    const {DOM} = global;
    const setCurrentByName = stub();
    
    DOM.setCurrentByName = setCurrentByName;
    findPrevious();
    
    t.ok(setCurrentByName.calledWith(undefined), 'should call setCurrentByName');
    t.end();
});

test('cloudcmd: client: vim: _next', (t) => {
    const result = _next(1, 2);
    
    t.notOk(result, 'should return 0');
    t.end();
});

test('cloudcmd: client: vim: _previous', (t) => {
    const result = _previous(0, 2);
    
    t.equal(result, 1, 'should return 1');
    t.end();
});

