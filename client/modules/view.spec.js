import('css-modules-require-hook/preset');

import test from 'supertape';
import {reRequire} from 'mock-require';

test('cloudcmd: client: view: initConfig', (t) => {
    let config;
    let i = 0;
    
    const {CloudCmd, DOM} = global;
    
    global.CloudCmd = {};
    global.DOM = {};
    
    const {_initConfig} = reRequire('./view');
    
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
    
    const {_initConfig} = reRequire('./view');
    const config = _initConfig();
    
    global.CloudCmd = CloudCmd;
    global.DOM = DOM;
    
    t.equal(typeof config, 'object', 'should equal');
    t.end();
});

