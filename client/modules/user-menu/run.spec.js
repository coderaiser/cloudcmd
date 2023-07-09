'use strict';

const {test, stub} = require('supertape');

const {runSelected} = require('./run');

test('cloudcmd: client: user menu: run', async (t) => {
    const runUserMenu = stub();
    const fn = stub();
    const selected = ['hello'];
    
    const items = {
        hello: fn,
    };
    
    await runSelected(selected, items, runUserMenu);
    
    t.calledWith(runUserMenu, [fn]);
    t.end();
});
