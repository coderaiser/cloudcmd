import autoGlobals from 'auto-globals';
import {stub} from '@cloudcmd/stub';
import {test as tape} from 'supertape';
import {
    _initConfig,
    _viewHtml,
    _Config,
    _createIframe,
} from './index.mjs';

const test = autoGlobals(tape);

test('cloudcmd: client: view: initConfig', (t) => {
    let config;
    let i = 0;
    
    const afterClose = () => ++i;
    const options = {
        afterClose,
    };
    
    config = _initConfig(options);
    config.afterClose();
    
    config = _initConfig(options);
    config.afterClose();
    
    t.equal(i, 2, 'should not change default config');
    t.end();
});

test('cloudcmd: client: view: initConfig: no options', (t) => {
    const config = _initConfig();
    
    t.equal(typeof config, 'object');
    t.end();
});

test('cloudcmd: client: view: html', (t) => {
    const open = stub();
    const modal = {
        open,
    };
    
    const src = '/hello.html';
    
    _viewHtml(src, {
        modal,
    });
    
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
    const src = '/hello.html';
    
    _createIframe(src, {
        createElement,
    });
    
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
    
    const src = '/hello.html';
    const result = _createIframe(src, {
        createElement,
    });
    
    t.equal(result, el);
    t.end();
});
