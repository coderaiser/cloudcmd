import test from 'supertape';
import tryToPromiseAll from './try-to-promise-all.js';

const resolve = Promise.resolve.bind(Promise);
const reject = Promise.reject.bind(Promise);

test('try-to-promise-all', async (t) => {
    const [, ...result] = await tryToPromiseAll([
        resolve('a'),
        resolve('b'),
    ]);
    
    const expected = ['a', 'b'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('try-to-promise-all: error', async (t) => {
    const [e] = await tryToPromiseAll([
        reject('a'),
    ]);
    
    t.equal(e, 'a');
    t.end();
});

