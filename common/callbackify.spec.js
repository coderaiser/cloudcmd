'use strict';

const test = require('supertape');
const callbackify = require('./callbackify');

test('cloudcmd: common: callbackify: error', (t) => {
    const promise = async () => {
        throw Error('hello');
    };
    
    const fn = callbackify(promise);
    
    fn((e) => {
        t.equal(e.message, 'hello');
        t.end();
    });
});

test('cloudcmd: common: callbackify', (t) => {
    const promise = async () => {
        return 'hi';
    };
    
    const fn = callbackify(promise);
    
    fn((e, data) => {
        t.equal(data, 'hi');
        t.end();
    });
});

