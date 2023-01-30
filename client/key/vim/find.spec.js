'use strict';

const test = require('supertape');
const dir = './';

const {getDOM} = require('./globals.fixture');

global.DOM = getDOM();

const {
    _next,
    _previous,
} = require(`${dir}find`);

test('cloudcmd: client: vim: _next', (t) => {
    const result = _next(1, 2);
    
    t.notOk(result, 'should return 0');
    t.end();
});

test('cloudcmd: client: vim: _previous', (t) => {
    const result = _previous(0, 2);
    
    t.equal(result, 1, 'should return 1');
    t.end();
});

