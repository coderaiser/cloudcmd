'use strict';

const {join} = require('node:path');
const {test, stub} = require('supertape');
const mockRequire = require('mock-require');

const dir = '../';

const pathVim = join(dir, 'vim');

const {getDOM, getCloudCmd} = require('./globals.fixture');

global.DOM = getDOM();
global.CloudCmd = getCloudCmd();

const vim = require(pathVim);

const {assign} = Object;
const {DOM} = global;
const {Buffer} = DOM;
const pathFind = join(dir, 'vim', 'find');
const {reRequire, stopAll} = mockRequire;

test('cloudcmd: client: key: set next file: no', (t) => {
    const element = {};
    const setCurrentFile = stub();
    const unselectFiles = stub();
    
    const Info = {
        element,
    };
    
    vim('j', {}, {
        Info,
        setCurrentFile,
        unselectFiles,
    });
    
    t.calledWith(setCurrentFile, [element], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: set next file current: j', async (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    const Info = {
        element,
    };
    
    await vim('j', {}, {
        Info,
        setCurrentFile,
        unselectFiles: stub(),
    });
    
    t.calledWith(setCurrentFile, [nextSibling], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: set next file current: mjj', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    const Info = {
        element,
    };
    
    const deps = {
        Info,
        setCurrentFile,
        unselectFiles: stub(),
    };
    
    vim('m', {}, deps);
    vim('j', {}, deps);
    vim('j', {}, deps);
    
    t.calledWith(setCurrentFile, [nextSibling], 'should set next file');
    t.end();
});

test('cloudcmd: client: key: set next file current: g', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    const Info = {
        element,
    };
    
    const deps = {
        Info,
        setCurrentFile,
        unselectFiles: stub(),
    };
    
    vim('g', {}, deps);
    vim('j', {}, deps);
    
    t.calledWith(setCurrentFile, [nextSibling], 'should ignore g');
    t.end();
});

test('cloudcmd: client: key: set +2 file current', (t) => {
    const last = {};
    const setCurrentFile = stub();
    const element = {};
    
    const Info = {
        element,
    };
    
    const deps = {
        setCurrentFile,
        Info,
        unselectFiles: stub(),
    };
    
    const event = {};
    
    vim('2', event, deps);
    vim('j', event, deps);
    
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
    
    const Info = {
        element,
    };
    
    const Operation = {
        show: stub(),
    };
    
    const selectFile = stub();
    const getCurrentName = stub().returns('x');
    
    const event = {};
    
    const deps = {
        Info,
        setCurrentFile,
        selectFile,
        getCurrentName,
        Operation,
    };
    
    vim('d', event, deps);
    vim('2', event, deps);
    vim('j', event, deps);
    
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
    
    const deps = {
        Info: {
            element,
        },
        Operation: {
            show,
        },
        setCurrentFile,
        selectFile: stub(),
        getCurrentName: stub().returns('x'),
        unselectFiles: stub(),
    };
    
    const event = {};
    
    vim('d', event, deps);
    vim('2', event, deps);
    vim('j', event, deps);
    
    t.calledWith(show, ['delete'], 'should call delete');
    t.end();
});

test('cloudcmd: client: key: set previous file current', (t) => {
    const previousSibling = 'hello';
    const element = {
        previousSibling,
    };
    
    const setCurrentFile = stub();
    const unselectFiles = stub();
    
    const Info = {
        element,
    };
    
    const deps = {
        Info,
        setCurrentFile,
        unselectFiles,
    };
    
    vim('k', {}, deps);
    
    t.calledWith(setCurrentFile, [previousSibling], 'should set previous file');
    t.end();
});

test('cloudcmd: client: key: copy: no', (t) => {
    const copy = stub();
    
    vim('y', {}, {
        unselectFiles: stub(),
        Buffer: {
            copy,
        },
    });
    
    t.notCalled(copy, 'should not copy files');
    t.end();
});

test('cloudcmd: client: key: copy', (t) => {
    const copy = stub();
    const Info = {
        element: {},
    };
    
    const toggleSelectedFile = stub();
    const unselectFiles = stub();
    
    const deps = {
        Info,
        unselectFiles,
        toggleSelectedFile,
        Buffer: {
            copy,
        },
    };
    
    vim('v', {}, deps);
    vim('y', {}, deps);
    
    t.calledWithNoArgs(copy, 'should copy files');
    t.end();
});

test('cloudcmd: client: key: copy: unselectFiles', (t) => {
    const unselectFiles = stub();
    const Info = {
        element: {},
    };
    
    const toggleSelectedFile = stub();
    
    const deps = {
        Info,
        unselectFiles,
        toggleSelectedFile,
        Buffer: {
            copy: stub(),
        },
    };
    
    vim('v', {}, deps);
    vim('y', {}, deps);
    
    t.calledWithNoArgs(unselectFiles, 'should unselect files');
    t.end();
});

test('cloudcmd: client: key: paste', (t) => {
    const paste = stub();
    
    Buffer.paste = paste;
    
    vim('p', {}, {
        Buffer,
    });
    
    t.calledWithNoArgs(paste, 'should paste files');
    t.end();
});

test('cloudcmd: client: key: selectFile: ..', (t) => {
    const getCurrentName = stub().returns('..');
    const selectFile = stub();
    const current = {};
    
    vim.selectFile(current, {
        selectFile,
        getCurrentName,
    });
    
    t.notCalled(selectFile, 'should not call selectFile');
    t.end();
});

test('cloudcmd: client: key: selectFile', (t) => {
    const selectFile = stub();
    const getCurrentName = stub().returns('x');
    const current = {};
    
    vim.selectFile(current, {
        selectFile,
        getCurrentName,
    });
    
    t.calledWith(selectFile, [current], 'should call selectFile');
    t.end();
});

test('cloudcmd: client: key: set last file current: shift + g', async (t) => {
    const last = 'last';
    const nextSibling = {
        nextSibling: last,
    };
    
    const element = {
        nextSibling,
    };
    
    const setCurrentFile = stub();
    
    await vim('G', {}, {
        Info: {
            element,
        },
        setCurrentFile,
        unselectFiles: stub(),
    });
    
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
    
    vim('$', {}, {
        Info: {
            element,
        },
        setCurrentFile,
        unselectFiles: stub(),
    });
    
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
    
    const Operation = {
        show: stub(),
    };
    
    const unselectFiles = stub();
    const setCurrentFile = stub();
    
    const deps = {
        Operation,
        unselectFiles,
        setCurrentFile,
        Info: {
            element,
        },
    };
    
    vim('g', {}, deps);
    vim('g', {}, deps);
    
    t.calledWith(setCurrentFile, [first], 'should set first file');
    t.end();
});

test('cloudcmd: client: key: set first file current: ^', async (t) => {
    const first = 'first';
    const previousSibling = {
        previousSibling: first,
    };
    
    const element = {
        previousSibling,
    };
    
    const Operation = {
        show: stub(),
    };
    
    const unselectFiles = stub();
    const setCurrentFile = stub();
    
    const deps = {
        setCurrentFile,
        Info: {
            element,
        },
        unselectFiles,
        Operation,
    };
    
    await vim('^', {}, deps);
    
    t.calledWith(setCurrentFile, [first], 'should set first file');
    t.end();
});

test('cloudcmd: client: key: visual', (t) => {
    const element = {};
    const toggleSelectedFile = stub();
    const Info = {
        element,
    };
    
    vim('v', {}, {
        Info,
        toggleSelectedFile,
    });
    
    t.calledWith(toggleSelectedFile, [element], 'should toggle selection');
    t.end();
});

test('cloudcmd: client: key: ESC', (t) => {
    const element = {};
    const unselectFiles = stub();
    const Info = {
        element,
    };
    
    vim('Escape', null, {
        Info,
        unselectFiles,
    });
    
    t.calledWithNoArgs(unselectFiles, 'should toggle selection');
    t.end();
});

test('cloudcmd: client: key: Enter', async (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling,
    };
    
    const unselectFiles = stub();
    const setCurrentFile = stub();
    
    const Info = {
        element,
    };
    
    await vim('Enter', null, {
        Info,
        setCurrentFile,
        unselectFiles,
    });
    
    await vim('j', null, {
        Info,
        setCurrentFile,
        unselectFiles,
    });
    
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
    
    t.calledWithNoArgs(preventDefault, 'should call preventDefault');
    t.end();
});

test('cloudcmd: client: find', (t) => {
    assign(DOM.Dialog, {
        prompt: stub().returns([]),
    });
    
    const setCurrentByName = stub();
    
    assign(DOM, {
        setCurrentByName,
    });
    
    const vim = reRequire(pathVim);
    
    const event = {
        preventDefault: stub(),
    };
    
    vim('/', event);
    
    stopAll();
    
    t.notCalled(setCurrentByName);
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
    
    stopAll();
    
    t.calledWithNoArgs(findNext, 'should call findNext');
    t.end();
});

test('cloudcmd: client: key: N', (t) => {
    const findPrevious = stub();
    
    mockRequire(pathFind, {
        findPrevious,
    });
    
    const vim = reRequire(`${dir}vim`);
    const event = {};
    
    vim('N', event);
    
    stopAll();
    
    t.calledWithNoArgs(findPrevious, 'should call findPrevious');
    t.end();
});

test('cloudcmd: client: key: make directory', async (t) => {
    const vim = reRequire(pathVim);
    const {DOM} = global;
    
    assign(DOM, {
        promptNewDir: stub(),
    });
    
    const event = {
        stopImmediatePropagation: stub(),
        preventDefault: stub(),
    };
    
    await vim('m', event);
    await vim('d', event);
    
    t.calledWithNoArgs(DOM.promptNewDir);
    t.end();
});

test('cloudcmd: client: key: make file', (t) => {
    const vim = reRequire(pathVim);
    const {DOM} = global;
    
    assign(DOM, {
        promptNewFile: stub(),
    });
    
    const event = {
        stopImmediatePropagation: stub(),
        preventDefault: stub(),
    };
    
    vim('m', event);
    vim('f', event);
    
    t.calledWithNoArgs(DOM.promptNewDir);
    t.end();
});

test('cloudcmd: client: vim: terminal', (t) => {
    const {CloudCmd} = global;
    
    assign(CloudCmd, {
        Terminal: {
            show: stub(),
        },
    });
    
    const event = {};
    
    vim('t', event);
    vim('t', event);
    
    t.calledWithNoArgs(CloudCmd.Terminal.show);
    t.end();
});

test('cloudcmd: client: vim: edit', async (t) => {
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const {CloudCmd} = global;
    
    assign(CloudCmd, {
        EditFileVim: {
            show: stub(),
        },
    });
    
    const event = {};
    
    await vim('e', event);
    
    t.calledWithNoArgs(CloudCmd.EditFileVim.show);
    t.end();
});
