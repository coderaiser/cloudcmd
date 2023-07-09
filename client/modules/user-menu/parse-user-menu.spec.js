'use strict';

const {test, stub} = require('supertape');

const parse = require('./parse-user-menu');

test('cloudcmd: user menu: parse', (t) => {
    const fn = stub();
    const __settings = {};
    const result = parse({
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
