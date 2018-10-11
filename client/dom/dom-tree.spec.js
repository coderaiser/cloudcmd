'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const tryCatch = require('try-catch');

const {
    isContainClass,
} = require('./dom-tree');

test('dom: isContainClass: no element', (t) => {
    const [e] = tryCatch(isContainClass);
    t.equal(e.message, 'element could not be empty!', 'should throw when no element');
    t.end();
});

test('dom: isContainClass: no className', (t) => {
    const [e] = tryCatch(isContainClass, {});
    t.equal(e.message, 'className could not be empty!', 'should throw when no element');
    t.end();
});

test('dom: isContainClass: contains', (t) => {
    const contains = sinon.stub();
    const el = {
        classList: {
            contains,
        }
    };
    
    const className = 'hello';
    isContainClass(el, className);
    
    t.ok(contains.calledWith(className), 'should call contains');
    t.end();
});

test('dom: isContainClass: contains: array', (t) => {
    const contains = sinon.stub();
    const el = {
        classList: {
            contains,
        }
    };
    
    const className = 'hello';
    isContainClass(el, [
        'world',
        className,
        'hello',
    ]);
    
    t.ok(contains.calledWith(className), 'should call contains');
    t.end();
});

