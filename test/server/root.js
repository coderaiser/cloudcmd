'use strict';

const path = require('path');
const test = require('tape');

const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const dir = path.join('..', '..', 'server');

const pathConfig = path.join(dir, 'config');
const pathRoot = `${dir}/root`;

const stub = require('mock-require');
const clean = require('clear-module');

test('cloudcmd: root: config', (t) => {
    clean(pathRoot);
    
    const originalConfig = require(pathConfig);
    const config = sinon.stub().returns(false);
    
    stub(pathConfig, config);
    
    const root = require(pathRoot);
    
    root('hello');
    
    t.ok(config.calledWith('root'), 'should call config');
    
    stub(pathConfig, originalConfig);
    t.end();
});

test('cloudcmd: root: mellow', (t) => {
    clean(pathRoot);
    
    const config = sinon.stub().returns('');
    const pathToWin = sinon.stub();
    
    const mellow = {
        pathToWin
    };
    
    const originalMellow = stub('mellow', mellow);
    const originalConfig = stub(pathConfig, config);
    
    const root = require(pathRoot);
    const dir = 'hello';
    const dirRoot = '/';
    
    root(dir);
    
    t.ok(pathToWin.calledWith(dir, dirRoot), 'should call mellow');
    
    stub('mellow', originalMellow);
    stub(pathConfig, originalConfig);
    
    t.end();
});

