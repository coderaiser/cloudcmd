import {test, stub} from 'supertape';
import {parseUserMenu} from './parse-user-menu.mjs';

test('cloudcmd: user menu: parse', (t) => {
    const fn = stub();
    const __settings = {};
    const result = parseUserMenu({
        __settings,
        'F2 - Rename file': fn,
        '_f': fn,
    });
    
    const names = [
        'F2 - Rename file',
    ];
    
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
