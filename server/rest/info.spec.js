'use strict';

const {
    test,
    stub,
} = require('supertape');
const info = require('./info');

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

