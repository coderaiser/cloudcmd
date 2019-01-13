'use strict';

const test = require('supertape');
const info = require('./info');
const stub = require('@cloudcmd/stub');

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

