import process from 'node:process';
import {test, stub} from 'supertape';
import info from './info.js';

test('cloudcmd: rest: info', (t) => {
    const {memoryUsage} = process;
    
    const _memoryUsage = stub().returns({});
    
    process.memoryUsage = _memoryUsage;
    
    info();
    
    process.memoryUsage = memoryUsage;
    
    t.calledWithNoArgs(_memoryUsage, 'should call memoryUsage');
    t.end();
});
