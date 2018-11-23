'use strict';

const test = require('tape');
const log = require('./log');
const config = require('../config');

test('distribute: log: getMessage', (t) => {
    const e = 'hello';
    const result = log.getMessage(e);
    
    t.equal(e, result, 'should equal');
    t.end();
});

test('distribute: log: getMessage: message', (t) => {
    const message = 'hello';
    const result = log.getMessage({
        message
    });
    
    t.equal(result, message, 'should equal');
    t.end();
});

test('distribute: log: config', (t) => {
    const logOriginal = config('log');
    config('log', true);
    log('log', 'test message');
    config('log', logOriginal);
    
    t.end();
});
