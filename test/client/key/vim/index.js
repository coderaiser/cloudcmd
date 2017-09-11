'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const dir = '../../../../client/key/';
const KEY = require(dir + 'key');

const {
    getDOM,
    getCloudCmd,
} = require('./globals');

global.DOM = global.DOM || getDOM();
global.CloudCmd = global.CloudCmd || getCloudCmd();

const DOM = global.DOM;
const Buffer = DOM.Buffer;

const vim = require(dir + 'vim');

test('cloudcmd: client: key: set next file: no', (t) => {
    const element = {
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('j', {});
    
    t.ok(setCurrentFile.calledWith(element), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: set next file current', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('j', {});
    
    t.ok(setCurrentFile.calledWith(nextSibling), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: set next file current', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('m', {});
    vim('j', {});
    vim('j', {});
    
    t.ok(setCurrentFile.calledWith(nextSibling), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: set next file current: g', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('g', {});
    vim('j', {});
    
    t.ok(setCurrentFile.calledWith(nextSibling), 'should ignore g');
    
    t.end();
});

test('cloudcmd: client: key: set +2 file current', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last
    };
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    const event = {};
    
    vim('2', event);
    vim('j', event);
    
    t.ok(setCurrentFile.calledWith(last), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: select +2 files from current before delete', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last
    };
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    global.DOM.selectFile = sinon.stub();
    global.DOM.getCurrentName = () => false;
    global.CloudCmd.Operation.show = sinon.stub();
    
    const event = {};
    
    vim('d', event);
    vim('2', event);
    vim('j', event);
    
    t.ok(setCurrentFile.calledWith(last), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: delete +2 files from current', (t) => {
    const last = {};
    const nextSibling = {
        nextSibling: last
    };
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    const show = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    global.DOM.selectFile = sinon.stub();
    global.DOM.getCurrentName = () => false;
    global.CloudCmd.Operation.show = show;
    
    const event = {};
    
    vim('d', event);
    vim('2', event);
    vim('j', event);
    
    t.ok(show.calledWith('delete'), 'should call delete');
    
    t.end();
});

test('cloudcmd: client: key: set previous file current', (t) => {
    const previousSibling = 'hello';
    const element = {
        previousSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('k', {});
    
    t.ok(setCurrentFile.calledWith(previousSibling), 'should set previous file');
    
    t.end();
});

test('cloudcmd: client: key: copy: no', (t) => {
    const copy = sinon.stub();
    
    Buffer.copy = copy;
    
    vim('y', {});
    
    t.notOk(copy.called, 'should not copy files');
    
    t.end();
});

test('cloudcmd: client: key: copy', (t) => {
    const copy = sinon.stub();
    
    Buffer.copy = copy;
    
    vim('v', {});
    vim('y', {});
    
    t.ok(copy.calledWith(), 'should copy files');
    
    t.end();
});

test('cloudcmd: client: key: copy: unselectFiles', (t) => {
    const unselectFiles = sinon.stub();
    
    DOM.unselectFiles = unselectFiles;
    
    vim('v', {});
    vim('y', {});
    
    t.ok(unselectFiles.calledWith(), 'should unselect files');
    
    t.end();
});

test('cloudcmd: client: key: paste', (t) => {
    const paste = sinon.stub();
    
    Buffer.paste = paste;
    
    vim('p', {});
    
    t.ok(paste.calledWith(), 'should paste files');
    
    t.end();
});

test('cloudcmd: client: key: selectFile: ..', (t) => {
    const selectFile = sinon.stub();
    const getCurrentName = sinon.stub();
    
    DOM.selectFile = selectFile;
    DOM.getCurrentName = () => '..';
    
    const current = {};
    vim.selectFile(current);
    
    t.notOk(getCurrentName.called, 'should not call selectFile');
    t.end();
});

test('cloudcmd: client: key: selectFile', (t) => {
    const selectFile = sinon.stub();
    
    DOM.selectFile = selectFile;
    DOM.getCurrentName = (a) => a.name;
    
    const current = {};
    
    vim.selectFile(current);
    
    t.ok(selectFile.calledWith(current), 'should call selectFile');
    t.end();
});

test('cloudcmd: client: key: set last file current', (t) => {
    const last = 'last';
    const nextSibling = {
        nextSibling: last
    };
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('G', {});
    
    t.ok(setCurrentFile.calledWith(last), 'should set last file');
    
    t.end();
});

test('cloudcmd: client: key: set first file current', (t) => {
    const first = 'first';
    const previousSibling= {
        previousSibling: first
    };
    
    const element = {
        previousSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.setCurrentFile = setCurrentFile;
    
    vim('g', {});
    vim('g', {});
    
    t.ok(setCurrentFile.calledWith(first), 'should set first file');
    
    t.end();
});

test('cloudcmd: client: key: visual', (t) => {
    const element = {
    };
    
    const toggleSelectedFile = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.toggleSelectedFile = toggleSelectedFile;
    
    vim('v', {});
    
    t.ok(toggleSelectedFile.calledWith(element), 'should toggle selection');
    
    t.end();
});

test('cloudcmd: client: key: ESC', (t) => {
    const element = {
    };
    
    const unselectFiles  = sinon.stub();
    
    global.DOM.CurrentInfo.element = element;
    global.DOM.unselectFiles = unselectFiles ;
    
    vim('', {
        keyCode: KEY.ESC
    });
    
    t.ok(unselectFiles.calledWith(), 'should toggle selection');
    
    t.end();
});

test('cloudcmd: client: key: Enter', (t) => {
    const nextSibling = 'hello';
    const element = {
        nextSibling
    };
    
    const setCurrentFile = sinon.stub();
    
    DOM.CurrentInfo.element = element;
    DOM.setCurrentFile = setCurrentFile;
    
    vim('', {
        keyCode: KEY.ENTER
    });
    
    vim('j', {});
    
    t.ok(setCurrentFile.calledWith(nextSibling), 'should set next file');
    
    t.end();
});

test('cloudcmd: client: key: /', (t) => {
    const preventDefault = sinon.stub();
    const element = {};
    
    DOM.CurrentInfo.element = element;
    DOM.getCurrentName = () => '';
    
    vim('/', {
        preventDefault
    });
    
    t.ok(preventDefault.calledWith(), 'should call preventDefault');
    t.end();
});

test('cloudcmd: client: key: n', (t) => {
    const findNext = sinon.stub();
    
    clean(dir + 'vim');
    stub(dir + 'vim/find', {
        findNext
    });
    
    const vim = require(dir + 'vim');
    const event = {};
    
    vim('n', event);
    
    t.ok(findNext.calledWith(), 'should call findNext');
    t.end();
});

test('cloudcmd: client: key: N', (t) => {
    const findPrevious = sinon.stub();
    
    clean(dir + 'vim');
    stub(dir + 'vim/find', {
        findPrevious,
    });
    
    const vim = require(dir + 'vim');
    const event = {};
    
    vim('N', event);
    
    t.ok(findPrevious.calledWith(), 'should call findPrevious');
    t.end();
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

function stub(name, fn) {
    require.cache[require.resolve(name)].exports = fn;
}

