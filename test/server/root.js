'use strict';

const path = require('path');
const test = require('tape');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const dir = path.join(__dirname, '..', '..', 'server');

const pathConfig = path.join(dir, 'config');
const pathRoot = `${dir}/root`;

const clean = require('clear-module');

const {cache, resolve} = require;
const stub = (name, exports) => {
    require(name);
    
    const resolved = resolve(name);
    cache[resolved].exports = exports;
};

test('cloudcmd: root: config', (t) => {
    clean(pathRoot);
    
    const config = sinon.stub().returns(false);
    
    stub(pathConfig, config);
    
    const root = require(pathRoot);
    
    root('hello');
    
    t.ok(config.calledWith('root'), 'should call config');
    
    clean(pathConfig);
    clean(pathRoot);
    
    t.end();
});

test('cloudcmd: root: mellow', (t) => {
    clean(pathRoot);
    
    const config = sinon.stub().returns('');
    const pathToWin = sinon.stub();
    
    const mellow = {
        pathToWin
    };
    
    stub('mellow', mellow);
    stub(pathConfig, config);
    
    const root = require(pathRoot);
    const dir = 'hello';
    const dirRoot = '/';
    
    root(dir);
    
    t.ok(pathToWin.calledWith(dir, dirRoot), 'should call mellow');
    
    clean('mellow');
    clean(pathConfig);
    clean(pathRoot);
    
    t.end();
});

