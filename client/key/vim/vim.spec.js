'use strict';

const test = require('supertape');
const vim = require('./vim');

test('vim: no operations', (t) => {
    const result = vim('hello', {});
    
    t.notOk(result);
    t.end();
});

