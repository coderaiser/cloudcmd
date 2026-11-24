import {test, stub} from 'supertape';
import {getJsonFromFileTable} from './get-json-from-file-table.js';

const run = (DOM) => {
    const {DOM: previous} = globalThis;
    
    globalThis.DOM = DOM;
    const result = getJsonFromFileTable();
    
    globalThis.DOM = previous;
    
    return result;
};

const getDOM = ({files}) => ({
    CurrentInfo: {
        files,
    },
    getCurrentDirPath: stub().returns('/hello'),
    getCurrentName: (current) => current.name,
    getCurrentSize: () => '1kb',
    getCurrentType: () => 'file',
    getByDataName: (name) => ({
        textContent: name,
    }),
});

test('client: getJsonFromFileTable: files', (t) => {
    const DOM = getDOM({
        files: [{
            name: '..',
        }, {
            name: 'a.txt',
        }],
    });
    
    const result = run(DOM);
    
    const expected = {
        path: '/hello',
        files: [{
            name: 'a.txt',
            size: '1kb',
            time: 'js-time',
            date: 'js-date',
            owner: 'js-owner',
            mode: 'js-mode',
            type: 'file',
        }],
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('client: getJsonFromFileTable: no files', (t) => {
    const DOM = getDOM({});
    const result = run(DOM);
    
    t.deepEqual(result.files, []);
    t.end();
});
