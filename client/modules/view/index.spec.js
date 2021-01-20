'use strict';

require('css-modules-require-hook/preset');

const autoGlobals = require('auto-globals');
const test = autoGlobals(require('supertape'));
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

test('cloudcmd: client: view: initConfig', (t) => {
    let config;
    let i = 0;
    
    const {CloudCmd, DOM} = global;
    
    global.CloudCmd = {};
    global.DOM = {};
    
    const {_initConfig} = reRequire('.');
    
    const afterClose = () => ++i;
    const options = {
        afterClose,
    };
    
    config = _initConfig(options);
    config.afterClose();
    
    config = _initConfig(options);
    config.afterClose();
    
    global.CloudCmd = CloudCmd;
    global.DOM = DOM;
    
    t.equal(i, 2, 'should not change default config');
    t.end();
});

test('cloudcmd: client: view: initConfig: no options', (t) => {
    const {CloudCmd, DOM} = global;
    
    global.CloudCmd = {};
    global.DOM = {};
    
    const {_initConfig} = reRequire('.');
    const config = _initConfig();
    
    global.CloudCmd = CloudCmd;
    global.DOM = DOM;
    
    t.equal(typeof config, 'object', 'should equal');
    t.end();
});

test('cloudcmd: client: view: html', (t) => {
    const {CloudCmd, DOM} = global;
    
    global.CloudCmd = {};
    global.DOM = {};
    const open = stub();
    
    mockRequire('@cloudcmd/modal', {
        open,
    });
    
    const {
        _viewHtml,
        _Config,
    } = reRequire('.');
    
    const src = '/hello.html';
    _viewHtml(src);
    
    global.CloudCmd = CloudCmd;
    global.DOM = DOM;
    
    const [first] = open.args;
    const [arg] = first;
    
    t.deepEqual(first, [arg, _Config]);
    t.end();
});

test('cloudcmd: client: view: createIframe', (t) => {
    const addEventListener = stub();
    const el = {
        addEventListener,
    };
    const createElement = stub().returns(el);
    
    mockRequire('@cloudcmd/create-element', createElement);
    const {_createIframe} = reRequire('.');
    
    const src = '/hello.html';
    _createIframe(src);
    
    const expected = {
        src,
        height: '100%',
        width: '100%',
    };
    
    t.calledWith(createElement, ['iframe', expected]);
    t.end();
});

test('cloudcmd: client: view: createIframe: returns', (t) => {
    const addEventListener = stub();
    const el = {
        addEventListener,
    };
    const createElement = stub().returns(el);
    
    mockRequire('@cloudcmd/create-element', createElement);
    const {_createIframe} = reRequire('.');
    
    const src = '/hello.html';
    const result = _createIframe(src);
    
    t.equal(result, el);
    t.end();
});
