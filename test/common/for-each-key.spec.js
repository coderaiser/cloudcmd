'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const forEachKey = require('../../common/for-each-key');

test('forEachKey: on property', (t) => {
    const obj = {
        a: 'hello',
    };
    
    const fn = sinon.stub();
    
    forEachKey(fn, obj);
    
    t.ok(fn.calledWith('a', 'hello'), 'should call fn');
    t.end();
});

test('forEachKey: a couple properties', (t) => {
    const obj = {
        a: 'hello',
        b: 'world',
    };
    
    const fn = sinon.stub();
    
    forEachKey(fn, obj);
    
    t.ok(fn.calledWith('b', 'world'), 'should call fn');
    t.end();
});

test('forEachKey: count', (t) => {
    const obj = {
        a: 'hello',
        b: 'world',
        c: 'some',
    };
    
    const fn = sinon.stub();
    
    forEachKey(fn, obj);
    
    t.equal(fn.callCount, 3, 'should ');
    t.end();
});
