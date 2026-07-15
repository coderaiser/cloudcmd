import process from 'node:process';
import {test, stub} from 'supertape';
import exit from './exit.js';

test('cloudcmd: exit: process.exit', (t) => {
    const {exit: exitOriginal} = process;
    const exitStub = stub();
    
    process.exit = exitStub;
    
    exit();
    process.exit = exitOriginal;
    
    t.calledWith(exitStub, [1], 'should call process.exit');
    t.end();
});

test('cloudcmd: exit: console.error', (t) => {
    const {exit: exitOriginal} = process;
    const {error} = console;
    const errorStub = stub();
    
    console.error = errorStub;
    process.exit = stub();
    
    exit('hello world');
    
    process.exit = exitOriginal;
    console.error = error;
    
    t.calledWith(errorStub, ['hello world'], 'should call console.error');
    t.end();
});

test('cloudcmd: exit.error: console.error: error', (t) => {
    const {exit: exitOriginal} = process;
    const {error} = console;
    const errorStub = stub();
    
    console.error = errorStub;
    process.exit = stub();
    
    exit(Error('hello world'));
    process.exit = exitOriginal;
    console.error = error;
    
    t.calledWith(errorStub, ['hello world'], 'should call console.error');
    t.end();
});
