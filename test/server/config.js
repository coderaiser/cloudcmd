'use strict';

const os = require('os');
const path = require('path');

const test = require('tape');
const readjson = require('readjson');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const root = '../../';
const dir = root + 'server/';
const config = require(dir + 'config');
const {_cryptoPass} = config;
const {apiURL} = require(root + 'common/cloudfunc');

const pathHomeConfig = path.join(os.homedir(), '.cloudcmd.json');
const pathConfig = path.join(__dirname, '..', '..', 'json', 'config.json');
const fixture = require('./config.fixture');

const clean = (name) => {
    delete require.cache[require.resolve(name)];
};

function readConfig() {
    return readjson.sync.try(pathHomeConfig) || require(pathConfig);
}

const before = require('../before');

test('config: manage', (t) => {
    t.equal(undefined, config(), 'should return "undefined"');
    t.end();
});

test('config: manage: get', (t) => {
    const editor = 'deepword';
    
    before({config: {editor}}, (port, after) => {
        t.equal(config('editor'), editor, 'should get config');
        t.end();
        after();
    });
});

test('config: manage: get', (t) => {
    const editor = 'deepword';
    const conf = {
        editor
    };
    
    before({config: conf}, (port, after) => {
        config('editor', 'dword');
        t.equal('dword', config('editor'), 'should set config');
        t.end();
        after();
    });
});

test('config: manage: get: *', (t) => {
    clean(dir + 'config');
    
    const config = require(dir + 'config');
    const data = config('*');
    const expected = Object.assign({}, require(pathConfig), readConfig());
    
    t.deepEqual(data, expected, 'should return config data');
    t.end();
});

test('config: listen: no socket', (t) => {
    t.throws(config.listen, 'should throw when no socket');
    t.end();
});

test('config: listen: authCheck: not function', (t) => {
    const socket = {};
    const fn = () => config.listen(socket, 'hello');
    
    t.throws(fn, 'should throw when authCheck not function');
    t.end();
});

test('config: cryptoPass: no password', (t) => {
    const json = {
        hello: 'world',
    };
    
    const result = _cryptoPass(json);
    
    t.equal(result, json, 'should not change json');
    t.end();
});

test('config: cryptoPass', (t) => {
    const json = {
        password: 'hello',
    };
    
    const {password} = fixture;
    
    const expected = {
        password,
    };
    
    const result = _cryptoPass(json);
    
    t.deepEqual(result, expected, 'should crypt password');
    t.end();
});

test('config: middle: no', (t) => {
    const {middle} = config;
    const next = sinon.stub();
    const res = null;
    const url = `${apiURL}/config`;
    const method = 'POST';
    const req = {
        url,
        method
    };
    
    middle(req, res, next);
    t.ok(next.calledWith(), 'should call next');
    t.end();
});

