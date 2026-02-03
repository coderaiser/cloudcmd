import {test} from 'supertape';
import * as eventStore from './event-store.js';

test('event-store: get', (t) => {
    const el = {};
    const name = 'click';
    const fn = () => {};
    
    eventStore.add(el, name, fn);
    const result = eventStore.get();
    
    const expected = [
        [
            el,
            name,
            fn,
        ],
    ];
    
    t.deepEqual(result, expected);
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
    
    t.deepEqual(result, expected);
    t.end();
});
