'use strict';

const autoGlobals = require('auto-globals');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {ESC} = require('./key');
const {
    getDOM,
    getCloudCmd,
} = require('./vim/globals.fixture');

const {reRequire, stopAll} = mockRequire;

const test = autoGlobals(require('supertape'));

global.DOM = getDOM();
global.CloudCmd = getCloudCmd();

test('cloudcmd: client: key: enable vim', async (t) => {
    const vim = stub();
    const {CloudCmd} = global;
    const {config} = CloudCmd;
    
    CloudCmd.config = stub().returns(true);
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
    
    const {_listener, setBind} = reRequire('.');
    
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    const {CloudCmd} = global;
    const {config} = CloudCmd;
    
    CloudCmd.config = _config;
    
    setBind();
    await _listener(event);
    await _listener(event);
    
    CloudCmd.config = config;
    
    t.calledWith(_config, ['vim']);
    t.end();
});

