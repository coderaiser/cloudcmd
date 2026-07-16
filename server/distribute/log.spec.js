import test from 'supertape';
import log from './log.js';
import {createConfig} from '../config.js';

test('distribute: log: getMessage', (t) => {
    const e = 'hello';
    const result = log.getMessage(e);
    
    t.equal(e, result);
    t.end();
});

test('distribute: log: getMessage: message', (t) => {
    const message = 'hello';
    const result = log.getMessage({
        message,
    });
    
    t.equal(result, message);
    t.end();
});

test('distribute: log: config', (t) => {
    const config = createConfig();
    const logOriginal = config('log');
    
    config('log', true);
    log('log', 'test message');
    config('log', logOriginal);
    
    t.end();
}, {
    checkAssertionsCount: false,
});


test('distribute: log: stringToRGB', (t) => {
    const result = log.stringToRGB('abc');
    
    t.deepEqual(result, [97, 3, 294], 'should return [charCode, length, crc]');
    t.end();
});

test('distribute: log: makeColor', (t) => {
    const result = log.makeColor('hello');
    
    t.ok(result.includes('hello'), 'should return colored string containing the input');
    t.end();
});


test('distribute: log: getDescription', (t) => {
    const message = 'some error';
    const result = log.getDescription({
        message,
    });
    
    t.equal(result, message, 'should return message from error object');
    t.end();
});

test('distribute: log: connectedStr', (t) => {
    t.ok(log.connectedStr, 'should have connectedStr');
    t.end();
});
