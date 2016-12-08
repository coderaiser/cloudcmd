'use strict';

const test = require('tape');
const before = require('../before');

test('validate: root: bad', (t) => {
    const config = {
        root: Math.random()
    };
    const fn = () => {
        before({config}, (port, after) => {
            t.fail('should not create server');
            after();
            t.end();
        });
    };
    
    t.throws(fn, /dir should be a string/, 'should throw');
    t.end();
});

