import test from 'supertape';
import stub from '@cloudcmd/stub';
import parse from './parse-user-menu.js';

test('cloudcmd: user menu: parse', (t) => {
    const fn = stub();
    const __settings = {};
    const result = parse({
        __settings,
        'F2 - Rename file': fn,
        '_f': fn,
    });
    
    const names = ['F2 - Rename file'];
    const keys = {
        F2: fn,
    };
    
    const items = {
        'Rename file': fn,
    };
    
    const expected = {
        names,
        keys,
        items,
        settings: __settings,
    };
    
    t.deepEqual(result, expected);
    t.end();
});
