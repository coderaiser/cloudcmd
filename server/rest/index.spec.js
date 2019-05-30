'use strict';

const test = require('supertape');
const tryToCatch = require('try-to-catch');

const rest = require('.');
const {
    _formatMsg,
    _getWin32RootMsg,
    _isRootWin32,
    _isRootAll,
    _onPUT,
} = rest;

test('rest: formatMsg', (t) => {
    const result = _formatMsg('hello', 'world');
    
    t.equal(result, 'hello: ok("world")', 'should be equal');
    t.end();
});

test('rest: formatMsg: json', (t) => {
    const result = _formatMsg('hello', {
        name: 'world',
    });
    
    t.equal(result, 'hello: ok("{"name":"world"}")', 'should parse json');
    t.end();
});

test('rest: getWin32RootMsg', (t) => {
    const {message} = _getWin32RootMsg();
    
    t.equal(message,'Could not copy from/to root on windows!', 'should return error');
    t.end();
});

test('rest: isRootWin32', (t) => {
    const result = _isRootWin32('/', '/');
    
    t.notOk(result, 'should equal');
    t.end();
});

test('rest: isRootAll', (t) => {
    const result = _isRootAll('/', ['/', '/h']);
    
    t.notOk(result, 'should equal');
    t.end();
});

test('rest: onPUT: no args', async (t) => {
    const [e] = await tryToCatch(_onPUT, {});
    t.equal(e.message, 'name should be a string!', 'should throw when no args');
    t.end();
});

test('rest: onPUT: no body', async (t) => {
    const [e] = await tryToCatch(_onPUT, {
        name: 'hello',
    });
    
    t.equal(e.message, 'body should be a string!', 'should throw when no body');
    t.end();
});

test('rest: onPUT: no callback', async (t) => {
    const [e] = await tryToCatch(_onPUT, {
        name: 'hello',
        body: 'world',
    });
    
    t.equal(e.message, 'callback should be a function!', 'should throw when no callback');
    t.end();
});

