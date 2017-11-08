'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const currify = require('currify');

const DIR = '../../server/';
const cloudcmd = require(DIR + 'cloudcmd');
const config = require(DIR + 'config');
const {
    _authenticate,
    _getPrefix,
} = cloudcmd;

test('cloudcmd: args: no', (t) => {
    const fn = () => cloudcmd();
    
    t.doesNotThrow(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

test('cloudcmd: args: plugins: error', (t) => {
    const fn = () => cloudcmd({
        plugins: ''
    });
    
    t.throws(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

test('cloudcmd: defaults: config', (t) => {
    const configDialog = config('configDialog');
    
    config('configDialog', false);
    cloudcmd();
    t.notOk(config('configDialog'), 'should not override config with defaults');
    
    config('configDialog', configDialog);
    
    t.end();
});

test('cloudcmd: defaults: console', (t) => {
    const console = config('console');
    config('console', false);
    cloudcmd();
    t.notOk(config('console'), 'should not override config with defaults');
    
    config('console', console);
    
    t.end();
});

test('cloudcmd: getPrefix', (t) => {
    const value = 'hello';
    const fn = () => value;
    const result = _getPrefix(fn);
    
    t.equal(result, value, 'should equal')
    t.end();
});

test('cloudcmd: authenticate: reject', (t) => {
    const success = sinon.stub();
    const emit = sinon.stub();
    const socket = {
        emit,
    };
    
    _authenticate(socket, success, 'hello', 'world');
    t.ok(emit.calledWith('reject'), 'should reject');
    t.end();
});

test('cloudcmd: authenticate: reject: success', (t) => {
    const success = sinon.stub();
    const emit = sinon.stub();
    const socket = {
        emit,
    };
    
    _authenticate(socket, success, 'hello', 'world');
    t.notOk(success.called, 'should not call success');
    t.end();
});

test('cloudcmd: authenticate: accept: success', (t) => {
    const success = sinon.stub();
    const emit = sinon.stub();
    const socket = {
        emit,
    };
    
    const set = credentials();
    const reset = set('hello', 'world');
    
    _authenticate(socket, success, 'hello', 'world');
    reset();
    
    t.ok(success.called, 'should call success');
    t.end();
});

function credentials() {
    const username = config('username');
    const password = config('password');
    
    const reset = () => {
        config('username', username);
        config('password', password);
    }
    
    const set = currify((fn, a, b) => {
        config('username', a);
        config('password', b);
        
        return fn;
    });
    
    return set(reset);
}

