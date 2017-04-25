'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

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
    
    t.end();
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

