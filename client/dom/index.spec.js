'use strict';

require('css-modules-require-hook/preset');

const {test, stub} = require('supertape');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

global.CloudCmd = {};

test('cloudcmd: client: dom: goToDirectory', async (t) => {
    const path = '';
    const {CloudCmd} = global;
    const changeDir = stub();
    const prompt = stub().returns([null, path]);
    
    CloudCmd.changeDir = changeDir;
    
    mockRequire('./dialog', {
        prompt,
    });
    
    const {goToDirectory} = reRequire('.');
    
    await goToDirectory();
    
    stopAll();
    
    t.calledWith(changeDir, [path]);
    t.end();
});
