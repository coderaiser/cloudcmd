import test from 'supertape';
import {
    getDotDotValues,
    getFileValues,
    getHeaderValues,
    getSize,
} from './fields.js';

const formatDate = (date) => `[${date}]`;
const mark = (name) => `${name}!`;

test('cloudfunc: fields: order', (t) => {
    const result = Object.keys(getDotDotValues({
        link: '',
    }));
    
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

test('cloudfunc: fields: getHeaderValues', (t) => {
    const result = getHeaderValues(mark);
    
    const expected = {
        name: 'name!',
        size: 'size!',
        time: 'time!',
        date: 'date!',
        owner: 'owner',
        mode: 'mode',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudfunc: fields: getDotDotValues', (t) => {
    const result = getDotDotValues({
        link: '<a>..</a>',
    });
    
    const expected = {
        name: '<a>..</a>',
        size: '&lt;dir&gt;',
        time: '--:--:--',
        date: '--.--.----',
        owner: '.',
        mode: '--- --- ---',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudfunc: fields: getFileValues', (t) => {
    const file = {
        name: 'a.txt',
        size: '1.00kb',
        date: '02.01.2026',
        time: '11:30:00',
        owner: 'coderaiser',
        mode: 'rw- r-- r--',
        type: 'file',
    };
    
    const result = getFileValues(file, {
        link: '<a>a.txt</a>',
        formatDate,
    });
    
    const expected = {
        name: '<a>a.txt</a>',
        size: '1.00kb',
        time: '11:30:00',
        date: '[02.01.2026]',
        owner: 'coderaiser',
        mode: 'rw- r-- r--',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudfunc: fields: getFileValues: defaults', (t) => {
    const file = {
        name: 'b',
        size: '0b',
        mode: 'rw- r-- r--',
        type: 'file',
    };
    
    const result = getFileValues(file, {
        link: '<a>b</a>',
        formatDate,
    });
    
    const expected = {
        name: '<a>b</a>',
        size: '0b',
        time: '--:--:--',
        date: '[--.--.----]',
        owner: 'root',
        mode: 'rw- r-- r--',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('cloudfunc: fields: getFileValues: directory', (t) => {
    const file = {
        name: 'src',
        size: '',
        type: 'directory',
    };
    
    const {size} = getFileValues(file, {
        link: '',
        formatDate,
    });
    
    t.equal(size, '&lt;dir&gt;');
    t.end();
});

test('cloudfunc: fields: getSize: directory', (t) => {
    const result = getSize({
        size: '1b',
        type: 'directory',
    });
    
    t.equal(result, '&lt;dir&gt;');
    t.end();
});

test('cloudfunc: fields: getSize: link', (t) => {
    const result = getSize({
        size: '1b',
        type: 'file-link',
    });
    
    t.equal(result, '&lt;link&gt;');
    t.end();
});

test('cloudfunc: fields: getSize: file', (t) => {
    const result = getSize({
        size: '1b',
        type: 'file',
    });
    
    t.equal(result, '1b');
    t.end();
});
