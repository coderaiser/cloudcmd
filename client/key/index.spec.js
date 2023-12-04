'use strict';

require('css-modules-require-hook/preset');

const autoGlobals = require('auto-globals');
const mockRequire = require('mock-require');
const supertape = require('supertape');

const {ESC} = require('./key');
const {getDOM, getCloudCmd} = require('./vim/globals.fixture');
const test = autoGlobals(supertape);
const {reRequire, stopAll} = mockRequire;
const {stub} = supertape;

global.DOM = getDOM();
global.CloudCmd = getCloudCmd();

test('cloudcmd: client: key: enable vim', async (t) => {
    const vim = stub();
    const {CloudCmd} = global;
    const {config} = CloudCmd;
    
    CloudCmd.config = stub().returns(true);
    CloudCmd._config = stub();
    mockRequire('./vim', vim);
    const {_listener, setBind} = reRequire('.');
    
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    setBind();
    await _listener(event);
    
    CloudCmd.config = config;
    stopAll();
    
    t.calledWith(vim, ['Escape', event]);
    t.end();
});

test('cloudcmd: client: key: disable vim', async (t) => {
    const _config = stub();
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    const {CloudCmd} = global;
    const {config} = CloudCmd;
    
    global.CloudCmd.config = _config;
    global.CloudCmd._config = _config;
    
    const {_listener, setBind} = reRequire('.');
    
    setBind();
    await _listener(event);
    
    CloudCmd.config = config;
    
    t.calledWith(_config, ['vim']);
    t.end();
});
