'use strict';

const test = require('tape');
const route = require('../../server/route');

test('cloudcmd: route: no args', (t) => {
    t.throws(route, /req could not be empty!/, 'should throw when no args');
    t.end();
});

test('cloudcmd: route: no res', (t) => {
    const fn = () => route({});
    
    t.throws(fn, /res could not be empty!/, 'should throw when no res');
    t.end();
});

test('cloudcmd: route: no next', (t) => {
    const fn = () => route({}, {});
    
    t.throws(fn, /next should be function!/, 'should throw when no next');
    t.end();
});

