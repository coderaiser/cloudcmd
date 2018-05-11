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
    const term = sinon.stub();
    const arg = 'hello';
    
    clean(terminalPath);
    stub(configPath, () => '/terminal');
    stub('/terminal', term);
    
    const terminal = require(terminalPath);
    terminal(arg);
    
    t.ok(term.calledWith(arg), 'should call terminal');
    t.end();
});

test('cloudcmd: terminal: enabled: no string', (t) => {
    const {log:originalLog} = console;
    const log = sinon.stub();
    
    clean(terminalPath);
    stub(configPath, () => 'hello');
    
    console.log = log;
    const terminal = require(terminalPath);
    terminal();
    console.log = originalLog;
    
    const msg = 'cloudcmd --terminal: Cannot find module \'hello\'';
    
    t.ok(log.calledWith(msg), 'should call exit');
    
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
    
    mock.stop('gritty');
    
    clean(configPath);
    require(configPath);
    
    t.end();
});

