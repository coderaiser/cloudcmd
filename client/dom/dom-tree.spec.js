'use strict';

const test = require('supertape');
const {create} = require('auto-globals');
const tryCatch = require('try-catch');

const {isContainClass} = require('./dom-tree');

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
    const el = create();
    const {contains} = el.classList;
    
    const className = 'hello';
    isContainClass(el, className);
    
    t.calledWith(contains, [className], 'should call contains');
    t.end();
});

test('dom: isContainClass: contains: array', (t) => {
    const el = create();
    const {contains} = el.classList;
    
    const className = 'hello';
    isContainClass(el, [
        'world',
        className,
        'hello',
    ]);
    
    t.calledWith(contains, [className], 'should call contains');
    t.end();
});

