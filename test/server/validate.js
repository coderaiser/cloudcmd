'use strict';

const test = require('tape');
const sinon = require('sinon');

const before = require('../before');
const dir = '../..';

const validatePath = `${dir}/server/validate`;
const exitPath = `${dir}/server/exit`;

const validate = require(validatePath);

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

function clean() {
    delete require.cache[require.resolve(validatePath)];
    delete require.cache[require.resolve(exitPath)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

