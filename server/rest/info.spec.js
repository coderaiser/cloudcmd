import test from 'supertape';
import info from './info.js';
import stub from '@cloudcmd/stub';

test('cloudcmd: rest: info', (t) => {
    const {memoryUsage} = process;
    
    const _memoryUsage = stub()
        .returns({});
    
    process.memoryUsage = _memoryUsage;
    
    info();
    
    process.memoryUsage = memoryUsage;
    
    t.ok(_memoryUsage.calledWith(), 'should call memoryUsage');
    t.end();
});

