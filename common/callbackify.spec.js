'use strict';

const tryToCatch = require('try-to-catch');

const {test, stub} = require('supertape');

const callbackify = require('./callbackify');
const {promisify} = require('util');

test('cloudcmd: common: callbackify: error', async (t) => {
    const promise = stub().rejects(Error('hello'));
    
    const fn = callbackify(promise);
    const newPromise = promisify(fn);
    const [error] = await tryToCatch(newPromise);
    
    t.equal(error.message, 'hello');
    t.end();
});

test('cloudcmd: common: callbackify', async (t) => {
    const promise = stub().resolves('hi');
    
    const fn = callbackify(promise);
    const promiseAgain = promisify(fn);
    const data = await promiseAgain();
    
    t.equal(data, 'hi');
    t.end();
});
