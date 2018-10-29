'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const configPath = '../../server/config';
const terminalPath = '../../server/terminal';

test('cloudcmd: terminal: disabled', (t) => {
    mockRequire(configPath, () => {
        return false;
    });
    
    const terminal = reRequire('../../server/terminal');
    const fn = terminal();
    
    mockRequire.stop(configPath);
    
    t.notOk(fn(), 'should return noop');
    t.end();
});

test('cloudcmd: terminal: disabled: listen', (t) => {
    mockRequire(configPath, () => false);
    
    const terminal = reRequire(terminalPath);
    const fn = terminal().listen();
    
    mockRequire.stop(configPath);
    reRequire(terminalPath);
    
    t.notOk(fn, 'should return noop');
    t.end();
});

test('cloudcmd: terminal: enabled', (t) => {
    const term = sinon.stub();
    const arg = 'hello';
    
    mockRequire(configPath, () => '/terminal');
    mockRequire(terminalPath, term);
    
    const terminal = require(terminalPath);
    terminal(arg);
    
    mockRequire.stop(configPath);
    mockRequire.stop(terminalPath);
    
    t.ok(term.calledWith(arg), 'should call terminal');
    t.end();
});

test('cloudcmd: terminal: enabled: no string', (t) => {
    const {log:originalLog} = console;
    const log = sinon.stub();
    
    mockRequire(configPath, () => 'hello');
    
    console.log = log;
    const terminal = reRequire(terminalPath);
    terminal();
    console.log = originalLog;
    
    mockRequire.stop(configPath);
    reRequire(terminalPath);
    
    const msg = 'cloudcmd --terminal: Cannot find module \'hello\'';
    
    t.ok(log.calledWith(msg), 'should call exit');
    t.end();
});

test('cloudcmd: terminal: no arg', (t) => {
    const gritty = {};
    
    mockRequire('gritty', gritty);
    mockRequire(configPath, (a) => {
        if (a === 'terminal')
            return true;
        
        return 'gritty';
    });
    
    const terminal = reRequire(terminalPath);
    const result = terminal();
    
    mockRequire.stop('gritty');
    mockRequire.stop(configPath);
    reRequire(terminalPath);
    
    t.equal(result, gritty, 'should equal');
    t.end();
});

