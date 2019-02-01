'use strict';

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const pathConfig = './config';
const pathRoot = './root';

test('cloudcmd: root: config', (t) => {
    const config = stub().returns(false);
    
    mockRequire(pathConfig, config);
    const root = reRequire(pathRoot);
    
    root('hello');
    
    mockRequire.stop(pathConfig);
    
    t.ok(config.calledWith('root'), 'should call config');
    t.end();
});

test('cloudcmd: root: mellow', (t) => {
    const config = stub().returns('');
    const pathToWin = stub();
    
    const mellow = {
        pathToWin,
    };
    
    mockRequire('mellow', mellow);
    mockRequire(pathConfig, config);
    
    const root = reRequire(pathRoot);
    const dir = 'hello';
    const dirRoot = '/';
    
    root(dir);
    
    mockRequire.stop('mellow');
    mockRequire.stopAll(pathConfig);
    reRequire(pathRoot);
    
    t.ok(pathToWin.calledWith(dir, dirRoot), 'should call mellow');
    t.end();
});

