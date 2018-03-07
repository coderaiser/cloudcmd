'use strict';

const test = require('tape');
const rest = require('../../server/rest');

const {
    _formatMsg,
    _getWin32RootMsg,
    _isRootWin32,
    _isRootAll,
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
    const result = _isRootWin32('/');
    
    t.notOk(result, 'should equal');
    t.end();
});

test('rest: isRootAll', (t) => {
    const result = _isRootAll(['/', '/h']);
    
    t.notOk(result, 'should equal');
    t.end();
});

