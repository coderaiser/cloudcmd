'use strict';

require('css-modules-require-hook/preset');

const {test, stub} = require('supertape');
const {getCSSVar, goToDirectory} = require('./index');

global.CloudCmd = {};

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
    
    global.getComputedStyle = stub().returns({
        getPropertyValue,
    });
    const result = getCSSVar('hello', {
        body,
    });
    
    delete global.getComputedStyle;
    
    t.notOk(result);
    t.end();
});

test('cloudcmd: client: dom: getCSSVar: 1', (t) => {
    const body = {};
    const getPropertyValue = stub().returns(1);
    
    global.getComputedStyle = stub().returns({
        getPropertyValue,
    });
    const result = getCSSVar('hello', {
        body,
    });
    
    delete global.getComputedStyle;
    
    t.ok(result);
    t.end();
});
