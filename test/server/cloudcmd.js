'use strict';

const test = require('tape');

const DIR = '../../server/';
const cloudcmd = require(DIR + 'cloudcmd');
const config = require(DIR + 'config');

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

