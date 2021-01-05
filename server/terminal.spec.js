'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');

const mockRequire = require('mock-require');

const terminalPath = './terminal';
const terminal = require('./terminal');
const {createConfigManager} = require('./cloudcmd');

test('cloudcmd: terminal: disabled', (t) => {
    const config = createConfigManager();
    config('terminal', false);
    
    const fn = terminal(config);
    
    t.notOk(fn(), 'should return noop');
    t.end();
});

test('cloudcmd: terminal: disabled: listen', (t) => {
    const config = createConfigManager();
    config('terminal', false);
    
    const fn = terminal(config).listen();
    
    t.notOk(fn, 'should return noop');
    t.end();
});

test('cloudcmd: terminal: enabled', (t) => {
    const term = stub();
    const arg = 'hello';
    
    mockRequire(terminalPath, term);
    
    const terminal = require(terminalPath);
    terminal(arg);
    
    t.calledWith(term, [arg], 'should call terminal');
    t.end();
});

test('cloudcmd: terminal: enabled: no string', (t) => {
    const {log: originalLog} = console;
    const log = stub();
    
    console.log = log;
    const config = createConfigManager();
    
    config('terminal', true);
    config('terminalPath', 'hello');
    terminal(config);
    
    console.log = originalLog;
    
    const msg = 'cloudcmd --terminal: Cannot find module \'hello\'';
    const [arg] = log.args[0];
    
    t.ok(arg.includes(msg), 'should call with msg');
    t.end();
});

test('cloudcmd: terminal: no arg', (t) => {
    const gritty = {};
    
    mockRequire('gritty', gritty);
    const config = createConfigManager();
    config('terminal', true);
    config('terminalPath', 'gritty');
    
    const result = terminal(config);
    
    mockRequire.stop('gritty');
    
    t.equal(result, gritty, 'should equal');
    t.end();
});

