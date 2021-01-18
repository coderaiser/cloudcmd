'use strict';

require('css-modules-require-hook');

const {test, stub} = require('supertape');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

global.CloudCmd = {};

test('cloudcmd: client: dom: goToDirectory', async (t) => {
    const path = '';
    const {CloudCmd} = global;
    const loadDir = stub();
    const prompt = stub().returns([null, path]);
    
    CloudCmd.loadDir = loadDir;
    
    mockRequire('./dialog', {
        prompt,
    });
    
    const {goToDirectory} = reRequire('.');
    
    await goToDirectory();
    
    stopAll();
    
    t.calledWith(loadDir, [{path}]);
    t.end();
});

