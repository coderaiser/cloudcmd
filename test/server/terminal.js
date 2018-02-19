'use strict';

const test = require('tape');
const mock = require('mock-require');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const stub = require('mock-require');
const clean = require('clear-module');

const configPath = '../../server/config';
const terminalPath = '../../server/terminal';

test('cloudcmd: terminal: disabled', (t) => {
    clean(terminalPath);
    stub(configPath, () => {
        return false;
    });
    
    const terminal = require('../../server/terminal');
    
    const fn = terminal();
    
    t.notOk(fn(), 'should return noop');
    
    clean(configPath);
    require(configPath);
    
    t.end();
});

test('cloudcmd: terminal: disabled: listen', (t) => {
    clean(terminalPath);
    stub(configPath, () => false);
    
    const terminal = require(terminalPath);
    
    const fn = terminal().listen();
    
    t.notOk(fn, 'should return noop');
    
    clean(configPath);
    require(configPath);
    
    t.end();
});

test('cloudcmd: terminal: enabled', (t) => {
    const {log} = console;
    console.log = sinon.stub();
    
    clean(terminalPath);
    stub(configPath, () => true);
    
    const terminal = require(terminalPath);
    terminal();
    
    const msg = 'cloudcmd --terminal: path must be a string';
    
    t.ok(console.log.calledWith(msg), 'should call exit');
    
    console.log = log;
    
    clean(configPath);
    require(configPath);
    
    t.end();
});

test('cloudcmd: terminal: no arg', (t) => {
    const gritty = {};
    
    mock('gritty', gritty);
    
    clean(terminalPath);
    stub(configPath, (a) => {
        if (a === 'terminal')
            return true;
        
        return 'gritty';
    });
    
    const terminal = require(terminalPath);
    const result = terminal();
    
    t.equal(result, gritty, 'should equal');
    
    clean(configPath);
    require(configPath);
    
    t.end();
});

