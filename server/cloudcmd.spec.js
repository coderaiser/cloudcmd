'use strict';

const path = require('path');

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const {reRequire} = require('mock-require');

const DIR = './';
const cloudcmdPath = DIR + 'cloudcmd';

const cloudcmd = require(cloudcmdPath);
const {
    createConfigManager,
    _getPrefix,
    _initAuth,
} = cloudcmd;

const {request} = require('serve-once')(cloudcmd, {
    config: {
        auth: false,
        dropbox: false,
    },
});

test('cloudcmd: args: no', (t) => {
    const fn = () => cloudcmd();
    
    t.doesNotThrow(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

test('cloudcmd: args: plugins: error', (t) => {
    const fn = () => cloudcmd({
        plugins: '',
    });
    
    t.throws(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

test('cloudcmd: defaults: config', (t) => {
    const configManager = createConfigManager();
    
    configManager('configDialog', false);
    
    cloudcmd({
        configManager,
    });
    
    t.notOk(configManager('configDialog'), 'should not override config with defaults');
    t.end();
});

test('cloudcmd: defaults: console', (t) => {
    const configManager = createConfigManager();
    configManager('console', false);
    
    cloudcmd({
        configManager,
    });
    
    t.notOk(configManager('console'), 'should not override config with defaults');
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

test('cloudcmd: replaceDist', (t) => {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = 'development';
    
    const {_replaceDist} = reRequire(cloudcmdPath);
    
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
    const {_replaceDist} = reRequire(cloudcmdPath);
    const result = _replaceDist(url);
    
    reset();
    
    t.equal(result, url, 'should equal');
    t.end();
});

test('cloudcmd: auth: reject', (t) => {
    const accept = stub();
    const reject = stub();
    
    const config = createConfigManager();
    
    const username = 'root';
    const password = 'toor';
    config('auth', true);
    config('username', username);
    config('password', password);
    
    _initAuth(config, accept, reject, username, 'abc');
    
    t.ok(reject.called, 'should reject');
    t.end();
});

test('cloudcmd: auth: accept', (t) => {
    const accept = stub();
    const reject = stub();
    
    const username = 'root';
    const password = 'toor';
    const auth = true;
    
    const config = createConfigManager();
    config('username', username);
    config('password', password);
    config('auth', auth);
    
    _initAuth(config, accept, reject, username, password);
    
    t.ok(accept.called, 'should accept');
    t.end();
});

test('cloudcmd: auth: accept: no auth', (t) => {
    const accept = stub();
    const reject = stub();
    
    const auth = false;
    const username = 'root';
    const password = 'toor';
    
    const config = createConfigManager();
    config('username', username);
    config('password', password);
    config('auth', auth);
    
    _initAuth(config, accept, reject, username, password);
    
    t.ok(accept.called, 'should accept');
    t.end();
});

test('cloudcmd: getIndexPath: production', (t) => {
    const isDev = false;
    const name = path.join(__dirname, '..', 'dist', 'index.html');
    
    t.equal(cloudcmd._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: getIndexPath: development', (t) => {
    const isDev = true;
    const name = path.join(__dirname, '..', 'dist-dev', 'index.html');
    
    t.equal(cloudcmd._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: sw', async (t) => {
    const {status} = await request.get('/sw.js');
    
    t.equal(status, 200, 'should return sw');
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

