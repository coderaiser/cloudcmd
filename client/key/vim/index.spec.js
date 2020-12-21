'use strict';

const {join} = require('path');

const test = require('supertape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;

const dir = '../';

const pathVim = join(dir, 'vim');
const pathFind = join(dir, 'vim', 'find');

const {
    getDOM,
    getCloudCmd,
} = require('./globals.fixture');

global.DOM = getDOM();
global.CloudCmd = getCloudCmd();

const {DOM} = global;
const {Buffer} = DOM;

const vim = require(pathVim);

test('cloudcmd: client: key: set next file: no', (t) => {
    const element = {
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('j', {});
    
    t.calledWith(setCurrentFile, [element], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: set next file current', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('j', {});
    
    t.calledWith(setCurrentFile, [nextSibling], 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: set next file current', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('m', {});
    vim('j', {});
    vim('j', {});
    
    t.calledWith(setCurrentFile, [nextSibling], 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: set next file current: g', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('g', {});
    vim('j', {});
    
    t.calledWith(setCurrentFile, [nextSibling], 'should ignore g');
    
    t.end();
});

test('cloudcmd: client: key: set +2 file current', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last,
    };
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    const event = {};
    
    vim('2', event);
    vim('j', event);
    
    t.calledWith(setCurrentFile, [last], 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: select +2 files from current before delete', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last,
    };
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    global.DOM.selectFile = stub();
    global.DOM.getCurrentName = () => false;
    global.CloudCmd.Operation.show = stub();
    
    const event = {};
    
    vim('d', event);
    vim('2', event);
    vim('j', event);
    
    t.calledWith(setCurrentFile, [last], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: delete +2 files from current', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last,
    };
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    const show = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    global.DOM.selectFile = stub();
    global.DOM.getCurrentName = () => false;
    global.CloudCmd.Operation.show = show;
    
    const event = {};
    
    vim('d', event);
    vim('2', event);
    vim('j', event);
    
    t.calledWith(show, ['delete'], 'should call delete');
    
    t.end();
});

test('cloudcmd: client: key: set previous file current', (t) => {
    const previousSibling = 'hello';
    const element = {
        previousSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('k', {});
    
    t.calledWith(setCurrentFile, [previousSibling], 'should set previous file');
    t.end();
});

test('cloudcmd: client: key: copy: no', (t) => {
    const copy = stub();
    
    Buffer.copy = copy;
    
    vim('y', {});
    
    t.notOk(copy.called, 'should not copy files');
    
    t.end();
});

test('cloudcmd: client: key: copy', (t) => {
    const copy = stub();
    
    Buffer.copy = copy;
    
    vim('v', {});
    vim('y', {});
    
    t.ok(copy.calledWith(), 'should copy files');
    t.end();
});

test('cloudcmd: client: key: copy: unselectFiles', (t) => {
    const unselectFiles = stub();
    
    DOM.unselectFiles = unselectFiles;
    
    vim('v', {});
    vim('y', {});
    
    t.ok(unselectFiles.calledWith(), 'should unselect files');
    t.end();
});

test('cloudcmd: client: key: paste', (t) => {
    const paste = stub();
    
    Buffer.paste = paste;
    
    vim('p', {});
    
    t.ok(paste.calledWith(), 'should paste files');
    
    t.end();
});

test('cloudcmd: client: key: selectFile: ..', (t) => {
    const selectFile = stub();
    const getCurrentName = stub();
    
    DOM.selectFile = selectFile;
    DOM.getCurrentName = () => '..';
    
    const current = {};
    vim.selectFile(current);
    
    t.notOk(getCurrentName.called, 'should not call selectFile');
    t.end();
});

test('cloudcmd: client: key: selectFile', (t) => {
    const selectFile = stub();
    
    DOM.selectFile = selectFile;
    DOM.getCurrentName = (a) => a.name;
    
    const current = {};
    
    vim.selectFile(current);
    
    t.calledWith(selectFile, [current], 'should call selectFile');
    t.end();
});

test('cloudcmd: client: key: set last file current: shift + g', (t) => {
    const last = 'last';
    const nextSibling = {
        nextSibling: last,
    };
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('G', {});
    
    t.calledWith(setCurrentFile, [last], 'should set last file');
    
    t.end();
});

test('cloudcmd: client: key: set last file current: $', (t) => {
    const last = 'last';
    const nextSibling = {
        nextSibling: last,
    };
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('$', {});
    
    t.calledWith(setCurrentFile, [last], 'should set last file');
    
    t.end();
});

test('cloudcmd: client: key: set first file current: gg', (t) => {
    const first = 'first';
    const previousSibling = {
        previousSibling: first,
    };
    
    const element = {
        previousSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('g', {});
    vim('g', {});
    
    t.calledWith(setCurrentFile, [first], 'should set first file');
    
    t.end();
});

test('cloudcmd: client: key: set first file current: ^', (t) => {
    const first = 'first';
    const previousSibling = {
        previousSibling: first,
    };
    
    const element = {
        previousSibling,
    };
    
    const setCurrentFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('^', {});
    
    t.calledWith(setCurrentFile, [first], 'should set first file');
    
    t.end();
});

test('cloudcmd: client: key: visual', (t) => {
    const element = {
    };
    
    const toggleSelectedFile = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.toggleSelectedFile = toggleSelectedFile;
    
    vim('v', {});
    
    t.calledWith(toggleSelectedFile, [element], 'should toggle selection');
    
    t.end();
});

test('cloudcmd: client: key: ESC', (t) => {
    const element = {
    };
    
    const unselectFiles = stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.unselectFiles = unselectFiles ;
    
    vim('Escape');
    
    t.ok(unselectFiles.calledWith(), 'should toggle selection');
    t.end();
});

test('cloudcmd: client: key: Enter', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    DOM.CurrentInfo.element = element;
    DOM.setCurrentFile = setCurrentFile;
    
    vim('Enter');
    
    vim('j');
    
    t.calledWith(setCurrentFile, [nextSibling], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: /', (t) => {
    const preventDefault = stub();
    const element = {};
    
    DOM.CurrentInfo.element = element;
    DOM.getCurrentName = () => '';
    
    vim('/', {
        preventDefault,
    });
    
    t.ok(preventDefault.calledWith(), 'should call preventDefault');
    t.end();
});

test('cloudcmd: client: key: n', (t) => {
    const findNext = stub();
    
    mockRequire(pathFind, {
        findNext,
    });
    
    const vim = reRequire(pathVim);
    const event = {};
    
    vim('n', event);
    
    stopAll(pathFind);
    
    t.ok(findNext.calledWith(), 'should call findNext');
    t.end();
});

test('cloudcmd: client: key: N', (t) => {
    const findPrevious = stub();
    
    mockRequire(pathFind, {
        findPrevious,
    });
    
    const vim = reRequire(dir + 'vim');
    const event = {};
    
    vim('N', event);
    
    stopAll(pathFind);
    
    t.ok(findPrevious.calledWith(), 'should call findPrevious');
    t.end();
});

