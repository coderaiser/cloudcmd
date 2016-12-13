'use strict';

const test = require('tape');
const root = '../../';
const config = require(root + 'lib/server/config');

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

