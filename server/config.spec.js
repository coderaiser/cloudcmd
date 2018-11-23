'use strict';

const os = require('os');
const path = require('path');

const test = require('tape');
const readjson = require('readjson');
const stub = require('@cloudcmd/stub');

const root = '../';
const dir = './';
const configPath = './config';

const config = require(configPath);
const {_cryptoPass} = config;
const {apiURL} = require(root + 'common/cloudfunc');

const pathHomeConfig = path.join(os.homedir(), '.cloudcmd.json');
const pathConfig = path.join(__dirname, '..', 'json', 'config.json');

const fixture = require('./config.fixture');
const {connect} = require('../test/before');

test('config: manage', (t) => {
    t.equal(undefined, config(), 'should return "undefined"');
    t.end();
});

test('config: manage: get', async (t) => {
    const editor = 'deepword';
    
    const {done} = await connect({
        config: {editor}
    });
    
    done();
    
    t.equal(config('editor'), editor, 'should get config');
    t.end();
});

test('config: manage: get', async (t) => {
    const editor = 'deepword';
    const conf = {
        editor
    };
    
    const {done} = await connect({config: conf});
    
    config('editor', 'dword');
    done();
    
    t.equal('dword', config('editor'), 'should set config');
    t.end();
});

test('config: manage: get: *', (t) => {
    const data = config('*');
    const keys = Object.keys(data);
    
    t.ok(keys.length > 1, 'should return config data');
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
    const next = stub();
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

