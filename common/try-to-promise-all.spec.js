'use strict';

const {test} = require('supertape');
const tryToPromiseAll = require('./try-to-promise-all');

const resolve = Promise.resolve.bind(Promise);
const reject = Promise.reject.bind(Promise);

test('commons: try-to-promise-all', async (t) => {
    const [, ...result] = await tryToPromiseAll([
        resolve('a'),
        resolve('b'),
    ]);
    
    const expected = [
        'a',
        'b',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('commons: try-to-promise-all: error', async (t) => {
    const [e] = await tryToPromiseAll([
        reject('a'),
    ]);
    
    t.equal(e, 'a');
    t.end();
});
