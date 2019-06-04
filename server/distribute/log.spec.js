'use strict';

const test = require('supertape');
const log = require('./log');
const {createConfig} = require('../config');

test('distribute: log: getMessage', (t) => {
    const e = 'hello';
    const result = log.getMessage(e);
    
    t.equal(e, result, 'should equal');
    t.end();
});

test('distribute: log: getMessage: message', (t) => {
    const message = 'hello';
    const result = log.getMessage({
        message,
    });
    
    t.equal(result, message, 'should equal');
    t.end();
});

test('distribute: log: config', (t) => {
    const config = createConfig();
    const logOriginal = config('log');
    
    config('log', true);
    log('log', 'test message');
    config('log', logOriginal);
    
    t.end();
});
