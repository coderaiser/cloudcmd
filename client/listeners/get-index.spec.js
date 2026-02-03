import test from 'supertape';
import {getIndex} from './get-index.js';

test('cloudcmd: client: listeners: getIndex: not found', (t) => {
    const array = ['hello'];
    
    t.equal(getIndex(array, 'world'), 0, 'should return index');
    t.end();
});

test('cloudcmd: client: listeners: getIndex: found', (t) => {
    const array = [
        'hello',
        'world',
    ];
    
    t.equal(getIndex(array, 'world'), 1, 'should return index');
    t.end();
});
