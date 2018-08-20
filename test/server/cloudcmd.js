'use strict';

const path = require('path');

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const currify = require('currify');
const clean = require('clear-module');
const request = require('request');
const {promisify} = require('es6-promisify');

const DIR = '../../server/';
const cloudcmdPath = DIR + 'cloudcmd';
const beforePath = '../before';

const config = require(DIR + 'config');
const cloudcmd = require(cloudcmdPath);
const {connect} = require(beforePath);
const {
    _getPrefix,
    _auth,
    _replacePrefix,
} = cloudcmd;

const get = promisify(request);

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
    const result = _getPrefix(value);
    
    t.equal(result, value, 'should equal');
    t.end();
});

test('cloudcmd: getPrefix: function', (t) => {
    const value = 'hello';
    const fn = () => value;
    const result = _getPrefix(fn);
    
    t.equal(result, value, 'should equal');
    t.end();
});

test('cloudcmd: getPrefix: function: empty', (t) => {
    const value = null;
    const fn = () => value;
    const result = _getPrefix(fn);
    
    t.equal(result, '', 'should equal');
    t.end();
});

test('cloudcmd: replacePrefix', (t) => {
    const url = '/hello';
    const prefix = url;
    const result = _replacePrefix(url, prefix);
    
    t.equal(result, '/', 'should equal');
    t.end();
});

test('cloudcmd: replaceDist', (t) => {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = 'development';
    
    clean(cloudcmdPath);
    
    const {_replaceDist} = require(cloudcmdPath);
    
    const url = '/dist/hello';
    const result = _replaceDist(url);
    const expected = '/dist-dev/hello';
    
    process.env.NODE_ENV = NODE_ENV;
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudcmd: replaceDist: !isDev', (t) => {
    const url = '/dist/hello';
    const cloudcmdPath = DIR + 'cloudcmd';
    
    const reset = cleanNodeEnv();
    
    clean(cloudcmdPath);
    const {_replaceDist} = require(cloudcmdPath);
    
    const result = _replaceDist(url);
    const expected = url;
    
    reset();
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudcmd: auth: reject', (t) => {
    const auth = config('auth');
    const accept = sinon.stub();
    const reject = sinon.stub();
    const username = 'root';
    const password = 'toor';
    
    const set = credentials();
    const reset = set('hello', 'world');
    config('auth', true);
    
    _auth(accept, reject, username, password);
    
    config('auth', auth);
    reset();
    
    t.ok(reject.called, 'should accept');
    t.end();
});

test('cloudcmd: auth: accept', (t) => {
    const auth = config('auth');
    const accept = sinon.stub();
    const reject = sinon.stub();
    const username = 'root';
    const password = 'toor';
    
    const set = credentials();
    const reset = set(username, password);
    config('auth', true);
    
    _auth(accept, reject, username, password);
    
    config('auth', auth);
    reset();
    
    t.ok(accept.called, 'should accept');
    t.end();
});

test('cloudcmd: auth: accept: no auth', (t) => {
    const auth = config('auth');
    const accept = sinon.stub();
    const reject = sinon.stub();
    const username = 'root';
    const password = 'toor';
    
    config('auth', false);
    _auth(accept, reject, username, password);
    config('auth', auth);
    
    t.ok(accept.called, 'should accept');
    t.end();
});

function credentials() {
    const username = config('username');
    const password = config('password');
    
    const reset = () => {
        config('username', username);
        config('password', password);
    };
    
    const set = currify((fn, a, b) => {
        config('username', a);
        config('password', b);
        
        return fn;
    });
    
    return set(reset);
}

test('cloudcmd: getIndexPath: production', (t) => {
    const isDev = false;
    const name = path.join(__dirname, '..', '..', 'dist', 'index.html');
    
    t.equal(cloudcmd._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: getIndexPath: development', (t) => {
    const isDev = true;
    const name = path.join(__dirname, '..', '..', 'dist-dev', 'index.html');
    
    t.equal(cloudcmd._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: sw', async (t) => {
    const {port, done} = await connect();
    const {statusCode}= await get(`http://localhost:${port}/sw.js`);
    
    await done();
    
    t.equal(statusCode, 200, 'should return sw');
    t.end();
});

function cleanNodeEnv() {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = '';
    
    const reset = () => {
        process.env.NODE_ENV = NODE_ENV;
    };
    
    return reset;
}

