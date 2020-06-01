'use strict';

const test = require('supertape');

const prefixer = require('./prefixer');

test('prefixer: prefix without a slash', (t) => {
    t.equal(prefixer('hello'), '/hello', 'should add slash');
    t.end();
});

test('prefixer: root', (t) => {
    t.equal(prefixer('/'), '', 'should add slash');
    t.end();
});

test('prefixer: with slash', (t) => {
    t.equal(prefixer('/hello'), '/hello', 'should add slash');
    t.end();
});

test('prefixer: not a string', (t) => {
    t.equal(prefixer(false), '', 'should add slash');
    t.end();
});
