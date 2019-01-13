'use strict';

const test = require('supertape');
const eventStore = require('./event-store');

test('event-store: get', (t) => {
    const el = {};
    const name = 'click';
    const fn = () => {};
    
    eventStore.add(el, name, fn);
    const result = eventStore.get();
    const expected = [
        [el, name, fn],
    ];
    
    t.deepEqual(expected, result, 'should equal');
    t.end();
});

test('event-store: clear', (t) => {
    const el = {};
    const name = 'click';
    const fn = () => {};
    
    eventStore.add(el, name, fn);
    eventStore.clear();
    
    const result = eventStore.get();
    const expected = [];
    
    t.deepEqual(expected, result, 'should equal');
    t.end();
});
