'use strict';

const test = require('supertape');
const exit = require('./exit');
const stub = require('@cloudcmd/stub');

test('cloudcmd: exit: process.exit', (t) => {
    const {exit: exitOriginal} = process;
    process.exit = stub();
    
    exit();
    t.calledWith(process.exit, [1], 'should call process.exit');
    process.exit = exitOriginal;
    
    t.end();
});

test('cloudcmd: exit: console.error', (t) => {
    const {exit: exitOriginal} = process;
    const {error} = console;
    
    console.error = stub();
    process.exit = stub();
    
    exit('hello world');
    t.calledWith(console.error, ['hello world'], 'should call console.error');
    
    process.exit = exitOriginal;
    console.error = error;
    
    t.end();
});

test('cloudcmd: exit.error: console.error: error', (t) => {
    const {exit: exitOriginal} = process;
    const {error} = console;
    
    console.error = stub();
    process.exit = stub();
    
    exit(Error('hello world'));
    t.calledWith(console.error, ['hello world'], 'should call console.error');
    
    process.exit = exitOriginal;
    console.error = error;
    
    t.end();
});

