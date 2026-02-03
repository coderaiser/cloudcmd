import {test, stub} from 'supertape';
import {runSelected} from './run.js';

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
