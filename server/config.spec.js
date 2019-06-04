'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const root = '../';
const configPath = './config';

const {
    createConfig,
    _cryptoPass,
} = require(configPath);
const config = createConfig();

const {apiURL} = require(root + 'common/cloudfunc');

const fixture = require('./config.fixture');
const {connect} = require('../test/before');

test('config: manage', (t) => {
    t.equal(undefined, config(), 'should return "undefined"');
    t.end();
});

test('config: manage: get', async (t) => {
    const editor = 'deepword';
    const configManager = createConfig();
    
    const {done} = await connect({
        config: {editor},
        configManager,
    });
    
    done();
    
    t.equal(configManager('editor'), editor, 'should get config');
    t.end();
});

test('config: manage: get', async (t) => {
    const editor = 'deepword';
    const conf = {
        editor,
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

test('config: cryptoPass: no password', (t) => {
    const json = {
        hello: 'world',
    };
    
    const config = createConfig();
    const result = _cryptoPass(config, json);
    
    t.deepEqual(result, [config, json], 'should not change json');
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
    
    const config = createConfig();
    const result = _cryptoPass(config, json);
    
    t.deepEqual(result, [config, expected], 'should crypt password');
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
        method,
    };
    
    middle(req, res, next);
    t.ok(next.calledWith(), 'should call next');
    t.end();
});

