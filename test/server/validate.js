'use strict';

const fs = require('fs');

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const before = require('../before');
const dir = '../..';

const validatePath = `${dir}/server/validate`;
const exitPath = `${dir}/server/exit`;
const columnsPath = `${dir}/server/columns`;

const validate = require(validatePath);
//const stub = require('mock-require');
const clear = require('clear-module');

const {cache, resolve} = require;
const stub = (name, exports) => {
    require(name);
    
    const resolved = resolve(name);
    cache[resolved].exports = exports;
};

test('validate: root: bad', (t) => {
    const config = {
        root: Math.random()
    };
    const fn = () => {
        before({config}, (port, after) => {
            t.fail('should not create server');
            after();
            t.end();
        });
    };
    
    t.throws(fn, /dir should be a string/, 'should throw');
    t.end();
});

test('validate: root: /', (t) => {
    const fn = sinon.stub();
    validate.root('/', fn);
    
    t.notOk(fn.called, 'should not call fn');
    t.end();
});

test('validate: root: /home', (t) => {
    const fn = sinon.stub();
    
    validate.root('/home', (...args) => {
        fn(...args);
        
        t.ok(fn.calledWith('root:', '/home'), 'should not call fn');
        t.end();
    });
});

test('validate: root: stat', (t) => {
    const fn = sinon.stub();
    const {stat} = fs;
    
    const error = 'ENOENT';
    fs.stat = (dir, fn) => fn(Error(error));
    
    clean();
    require(exitPath);
    stub(exitPath, fn);
    
    const {root} = require(validatePath);
    
    root('hello', fn);
    
    const msg = 'cloudcmd --root: %s';
    t.ok(fn.calledWith(msg, error), 'should call fn');
    
    fs.stat = stat;
    t.end();
});

test('validate: packer: not valid', (t) => {
    const fn = sinon.stub();
    
    clean();
    require(exitPath);
    stub(exitPath, fn);
    
    const {packer} = require(validatePath);
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    packer('hello');
    
    t.ok(fn.calledWith(msg), 'should call fn');
    
    t.end();
});

test('validate: editor: not valid', (t) => {
    const fn = sinon.stub();
    
    clean();
    require(exitPath);
    stub(exitPath, fn);
    
    const {editor} = require(validatePath);
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    editor('hello');
    
    t.ok(fn.calledWith(msg), 'should call fn');
    
    t.end();
});

test('validate: columns', (t) => {
    const fn = sinon.stub();
    
    clean();
    require(exitPath);
    stub(exitPath, fn);
    
    const {columns} = require(validatePath);
    
    columns('name-size-date');
    
    t.notOk(fn.called, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', (t) => {
    const fn = sinon.stub();
    
    clean();
    clear(columnsPath);
    require(exitPath);
    stub(exitPath, fn);
    stub(columnsPath, {
        'name-size-date': '',
        'name-size': '',
    });
    
    const {columns} = require(validatePath);
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    columns('hello');
    
    t.ok(fn.calledWith(msg), 'should call exit');
    t.end();
});

function clean() {
    clear(validatePath);
    clear(exitPath);
}

