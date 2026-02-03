import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import serveOnce from 'serve-once';
import {test, stub} from 'supertape';
import cloudcmd, {
    _isDev,
    _replaceDist,
    createConfigManager,
    _getPrefix,
    _initAuth,
    _getIndexPath,
} from '#server/cloudcmd';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

test('cloudcmd: replaceDist', (t) => {
    const currentIsDev = _isDev();
    
    _isDev(true);
    const url = '/dist/hello';
    const result = _replaceDist(url);
    const expected = '/dist-dev/hello';
    
    _isDev(currentIsDev);
    
    t.equal(result, expected);
    t.end();
});

test('cloudcmd: replaceDist: !isDev', (t) => {
    const url = '/dist/hello';
    
    const currentIsDev = _isDev();
    _isDev(false);
    const result = _replaceDist(url);
    
    _isDev(currentIsDev);
    
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
    const {status} = await request.get('/sw.mjs');
    
    t.equal(status, 200, 'should return sw');
    t.end();
});

test('cloudcmd: manifest.json', async (t) => {
    const config = {
        auth: true,
    };
    
    const options = {
        config,
    };
    
    const {status} = await request.get('/public/manifest.json', {
        options,
    });
    
    t.equal(status, 200, 'should return manifest.json even when authentication is enabled');
    t.end();
});
