import {test, stub} from 'supertape';
import {getCSSVar, goToDirectory} from './index.mjs';

globalThis.CloudCmd = {};

test('cloudcmd: client: dom: goToDirectory', async (t) => {
    const path = '';
    const changeDir = stub();
    const prompt = stub().returns([null, path]);
    
    await goToDirectory({
        prompt,
        changeDir,
    });
    
    t.calledWith(changeDir, [path]);
    t.end();
});

test('cloudcmd: client: dom: getCSSVar', (t) => {
    const body = {};
    const getPropertyValue = stub().returns(0);
    
    globalThis.getComputedStyle = stub().returns({
        getPropertyValue,
    });
    const result = getCSSVar('hello', {
        body,
    });
    
    delete globalThis.getComputedStyle;
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: client: dom: getCSSVar: 1', (t) => {
    const body = {};
    const getPropertyValue = stub().returns(1);
    
    globalThis.getComputedStyle = stub().returns({
        getPropertyValue,
    });
    const result = getCSSVar('hello', {
        body,
    });
    
    delete globalThis.getComputedStyle;
    
    t.ok(result);
    t.end();
});
