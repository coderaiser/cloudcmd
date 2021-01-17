'use strict';

const autoGlobals = require('auto-globals');
const test = autoGlobals(require('supertape'));
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

const {ESC} = require('./key');

const {
    getDOM,
    getCloudCmd,
} = require('./vim/globals.fixture');

const DOM = getDOM();
const CloudCmd = getCloudCmd();

global.DOM = DOM;
global.CloudCmd = CloudCmd;

test('cloudcmd: client: key: enable vim', async (t) => {
    const vim = stub();
    const configStub = stub().returns(true);
    const {CloudCmd} = global;
    const {config} = CloudCmd;
    
    CloudCmd.config = configStub;
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

