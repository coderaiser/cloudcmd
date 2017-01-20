'use strict';

const os = require('os');
const path = require('path');

const test = require('tape');
const readjson = require('readjson');

const root = '../../';
const dir = root + 'server/';
const config = require(dir + 'config');

const pathConfig = path.join(os.homedir(), '.cloudcmd.json');
const localConfig = path.join(__dirname, '..', '..', 'json', 'config.json');

const clean = (name) => {
    delete require.cache[require.resolve(name)];
};

function readConfig() {
    return readjson.sync.try(pathConfig) || require(localConfig);
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
    
    t.deepEqual(data, readConfig(), 'should return config data');
    t.end();
});

