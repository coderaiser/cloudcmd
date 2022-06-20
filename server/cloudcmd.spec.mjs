import {dirname} from 'path';
import {fileURLToPath} from 'url';
import serveOnce from 'serve-once';
const __filename = fileURLToPath(import.meta.url);
import {createMockImport} from 'mock-import';
const __dirname = dirname(__filename);

const {reImport} = createMockImport(import.meta.url);

import path from 'path';

import {
    test,
    stub,
} from 'supertape';

const DIR = './';
const cloudcmdPath = DIR + 'cloudcmd.mjs';

import cloudcmd, {
    createConfigManager,
    _getPrefix,
    _initAuth,
    _getIndexPath,
} from './cloudcmd.mjs';

const {request} = serveOnce(cloudcmd, {
    config: {
        auth: false,
        dropbox: false,
    },
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
    
    t.equal(result, value);
    t.end();
});

test('cloudcmd: getPrefix: function', (t) => {
    const value = 'hello';
    const fn = () => value;
    const result = _getPrefix(fn);
    
    t.equal(result, value);
    t.end();
});

test('cloudcmd: getPrefix: function: empty', (t) => {
    const value = null;
    const fn = () => value;
    const result = _getPrefix(fn);
    
    t.equal(result, '');
    t.end();
});

test('cloudcmd: replaceDist', async (t) => {
    const {NODE_ENV} = process.env;
    process.env.NODE_ENV = 'development';
    
    const {_replaceDist} = await reImport(cloudcmdPath);
    
    const url = '/dist/hello';
    const result = _replaceDist(url);
    const expected = '/dist-dev/hello';
    
    process.env.NODE_ENV = NODE_ENV;
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: replaceDist: !isDev', async (t) => {
    const url = '/dist/hello';
    
    const reset = cleanNodeEnv();
    const {_replaceDist} = await reImport('./cloudcmd.mjs');
    const result = _replaceDist(url);
    
    reset();
    
    t.equal(result, url);
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
    
    t.equal(_getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: getIndexPath: development', (t) => {
    const isDev = true;
    const name = path.join(__dirname, '..', 'dist-dev', 'index.html');
    
    t.equal(_getIndexPath(isDev), name);
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

