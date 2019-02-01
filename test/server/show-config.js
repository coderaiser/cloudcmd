'use strict';

const test = require('supertape');
const showConfig = require('../../server/show-config');

test('cloudcmd: show-config: no arguments', (t) => {
    t.throws(showConfig, /config could not be empty!/, 'should throw when no config');
    t.end();
});

test('cloudcmd: show-config: bad arguments', (t) => {
    const fn = () => showConfig('hello');
    t.throws(fn, /config should be an object!/, 'should throw when config not object');
    t.end();
});

test('cloudcmd: show-config: return', (t) => {
    t.equal(showConfig({}), '', 'should return string');
    t.end();
});

test('cloudcmd: show-config: return', (t) => {
    const config = {
        hello: 'world',
    };
    
    const result = [
        '+-------+--------------------------------+\n',
        '| hello | world                          |\n',
        '+-------+--------------------------------+\n',
    ].join('');
    
    t.equal(showConfig(config), result, 'should return table');
    t.end();
});

