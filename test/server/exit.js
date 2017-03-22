'use strict';

const test = require('tape');
const exit = require('../../server/exit');
const sinon = require('sinon');

test('cloudcmd: exit: process.exit', (t) => {
    const {exit:exitOriginal} = process;
    process.exit = sinon.stub();
    
    exit();
    t.ok(process.exit.calledWith(1), 'should call process.exit');
    process.exit = exitOriginal;
    
    t.end();
});

test('cloudcmd: exit: console.error', (t) => {
    const {exit:exitOriginal} = process;
    const {error} = console;

    console.error = sinon.stub();
    process.exit = sinon.stub();
    
    exit('hello world');
    t.ok(console.error.calledWith('hello world'), 'should call console.error');
    
    process.exit = exitOriginal;
    console.error = error;
    
    t.end();
});
