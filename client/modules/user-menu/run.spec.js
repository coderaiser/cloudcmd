'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const {runSelected} = require('./run');

test('cloudcmd: client: user menu: run', async (t) => {
    const runUserMenu = stub();
    const fn = stub();
    const selected = [
        'hello',
    ];
    
    const items = {
        hello: fn,
    };
    
    await runSelected(selected, items, runUserMenu);
    
    t.calledWith(runUserMenu, [fn]);
    t.end();
});

