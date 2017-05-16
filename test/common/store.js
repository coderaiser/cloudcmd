'use strict';

const dir = '../../common';
const store = require(`${dir}/store`);
const test = require('tape');

test('cloudcmd: common: store: set', (t) => {
    const name = store();
    const str = 'hello';
    name(str);
    
    t.equal(name(), str, 'should return stored value');
    t.end();
});

test('cloudcmd: common: store: first get', (t) => {
    const name = store();
    
    t.equal(name(), undefined, 'should return undefined');
    t.end();
});

