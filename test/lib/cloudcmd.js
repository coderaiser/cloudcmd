'use strict';

const test = require('tape');
const cloudcmd = require('../../lib/cloudcmd');

test('cloudcmd: args: no', (t) => {
    const fn = () => cloudcmd();
    
    t.doesNotThrow(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

test('cloudcmd: args: plugins: error', (t) => {
    const fn = () => cloudcmd({
        plugins: ''
    });
    
    t.throws(fn, /plugins should be an array!/, 'should throw when plugins not an array');
    t.end();
});

