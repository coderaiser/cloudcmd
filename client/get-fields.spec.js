import {test, stub} from 'supertape';
import {getFields} from './get-fields.js';

test('client: getFields: registry order', (t) => {
    const DOM = getDOM();
    const result = Object.keys(getFields(DOM, {}));
    
    const expected = [
        'name',
        'size',
        'time',
        'date',
        'owner',
        'mode',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('client: getFields: values', (t) => {
    const DOM = getDOM();
    const current = {};
    
    const result = getFields(DOM, current);
    
    const expected = {
        name: 'a.txt',
        size: '1kb',
        time: 'js-time!',
        date: 'js-date!',
        owner: 'js-owner!',
        mode: 'js-mode!',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('client: getFields: current passed to getters', (t) => {
    const DOM = getDOM();
    const current = {};
    
    getFields(DOM, current);
    
    t.calledWith(DOM.getCurrentName, [current]);
    t.end();
});

const getDOM = () => ({
    getCurrentName: stub().returns('a.txt'),
    getCurrentSize: stub().returns('1kb'),
    getByDataName: (name) => ({
        textContent: `${name}!`,
    }),
});
