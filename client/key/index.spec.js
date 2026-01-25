'use strict';

require('css-modules-require-hook/preset');

const autoGlobals = require('auto-globals');
const supertape = require('supertape');

const {ESC} = require('./key.mjs');

const {Key, _listener} = require('./index.mjs');

const {getDOM, getCloudCmd} = require('./vim/globals.fixture');
const test = autoGlobals(supertape);
const {stub} = supertape;

globalThis.DOM = getDOM();
globalThis.CloudCmd = getCloudCmd();

test('cloudcmd: client: key: enable vim', async (t) => {
    const vim = stub();
    const config = stub().returns(true);
    const _config = stub();
    
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    Key.setBind();
    
    await _listener(event, {
        vim,
        config,
        _config,
        switchKey: stub(),
    });
    
    t.calledWith(vim, ['Escape', event]);
    t.end();
});

test('cloudcmd: client: key: disable vim', async (t) => {
    const _config = stub();
    const config = stub();
    const event = {
        keyCode: ESC,
        key: 'Escape',
        altKey: false,
    };
    
    Key.setBind();
    await _listener(event, {
        config,
        _config,
        switchKey: stub(),
    });
    
    t.calledWith(_config, ['vim', true]);
    t.end();
});
