'use strict';

const test = require('tape');
const info = require('./info');
const sinon = require('sinon');

test('cloudcmd: rest: info', (t) => {
    const {memoryUsage} = process;
    
    const _memoryUsage = sinon
        .stub()
        .returns({});
    
    process.memoryUsage = _memoryUsage;
    
    info();
    
    process.memoryUsage = memoryUsage;
    
    t.ok(_memoryUsage.calledWith(), 'should call memoryUsage');
    t.end();
});

