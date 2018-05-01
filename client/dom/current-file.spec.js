'use strict';

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));

const currentFile = require('./current-file');

test('current-file: setCurrentName: setAttribute', (t) => {
    const {
        DOM,
        CloudCmd,
    } = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const setAttribute = sinon.stub();
    const current = {
        setAttribute
    };
    
    currentFile.setCurrentName('hello', current);
    
    t.ok(setAttribute.calledWith('data-name', 'js-file-aGVsbG8='), 'should call setAttribute');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: setCurrentName: setAttribute: cyrillic', (t) => {
    const {
        DOM,
        CloudCmd,
    } = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const setAttribute = sinon.stub();
    const current = {
        setAttribute
    };
    
    currentFile.setCurrentName('ай', current);
    
    t.ok(setAttribute.calledWith('data-name', 'js-file-JUQwJUIwJUQwJUI5'), 'should call setAttribute');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: emit', (t) => {
    const {
        DOM,
        CloudCmd,
    } = global;
    
    const emit = sinon.stub();
    const setAttribute = sinon.stub();
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd({
        emit,
    });
    
    const current = {
        setAttribute,
    };
    
    currentFile.setCurrentName('hello', current);
    
    t.ok(emit.calledWith('current-file', current), 'should call emit');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: return', (t) => {
    const {
        DOM,
        CloudCmd,
    } = global;
    
    const setAttribute = sinon.stub();
    const link = {};
    
    global.DOM = getDOM({
        link
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = {
        setAttribute,
    };
    
    const result = currentFile.setCurrentName('hello', current);
    
    t.equal(result, link, 'should return link');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

function getCloudCmd({emit} = {}) {
    return {
        PREFIX: '',
        emit: emit || sinon.stub(),
    };
}


function getDOM({link} = {}) {
    link = link || {};
    
    return {
        CurrentInfo: {
            link,
            dirPath: '/',
        }
    };
}
