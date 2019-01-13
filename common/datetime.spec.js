'use strict';

const test = require('supertape');
const datetime = require('./datetime');

test('common: datetime', (t) => {
    const dateStr = 'Fri, 17 Aug 2018 10:56:48';
    const result = datetime(new Date(dateStr));
    
    const expected = '2018.08.17 10:56:48';
    
    t.equals(result, expected, 'should equal');
    t.end();
});

test('common: datetime: no arg', (t) => {
    const {Date} = global;
    
    let called = false;
    const myDate = class extends Date {
        constructor() {
            super();
            called = true;
        }
    };
    
    global.Date = myDate;
    
    datetime();
    
    global.Date = Date;
    t.ok(called, 'should call new Date');
    t.end();
});

test('common: 0 before number', (t) => {
    const dateStr = 'Fri, 17 Aug 2018 10:56:08';
    const result = datetime(new Date(dateStr));
    
    const expected = '2018.08.17 10:56:08';
    
    t.equals(result, expected, 'should equal');
    t.end();
});

test('common: datetime: wrong args', (t) => {
    const fn = () => datetime({});
    
    t.throws(fn, /date should be instanceof Date!/, 'should throw');
    t.end();
});

