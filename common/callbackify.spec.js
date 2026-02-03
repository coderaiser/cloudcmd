import {promisify} from 'node:util';
import {tryToCatch} from 'try-to-catch';
import {test, stub} from 'supertape';
import callbackify from './callbackify.js';

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
