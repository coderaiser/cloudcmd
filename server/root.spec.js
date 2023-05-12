'use strict';

const {
    test,
    stub,
} = require('supertape');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

const pathConfig = './config';
const pathRoot = './root';

test('cloudcmd: root: mellow', (t) => {
    const config = stub().returns('');
    const webToWin = stub();
    
    const mellow = {
        webToWin,
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
    
    stopAll();
    
    t.calledWith(webToWin, [dir, dirRoot], 'should call mellow');
    t.end();
});

