'use strict';

const {test, stub} = require('supertape');

const {create} = require('auto-globals');
const wraptile = require('wraptile');
const currentFile = require('./current-file');
const id = (a) => a;

const returns = wraptile(id);
const {_CURRENT_FILE} = currentFile;

test('current-file: setCurrentName: setAttribute', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    const {setAttribute} = current;
    
    currentFile.setCurrentName('hello', current);
    
    t.calledWith(setAttribute, ['data-name', 'js-file-aGVsbG8='], 'should call setAttribute');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: setCurrentName: setAttribute: cyrillic', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    const {setAttribute} = current;
    
    currentFile.setCurrentName('ай', current);
    
    t.calledWith(setAttribute, ['data-name', 'js-file-JUQwJUIwJUQwJUI5'], 'should call setAttribute');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: getCurrentName', (t) => {
    const current = create();
    current.getAttribute.returns('js-file-Ymlu');
    
    const result = currentFile.getCurrentName(current);
    
    t.equal(result, 'bin');
    t.end();
});

test('current-file: emit', (t) => {
    const {DOM, CloudCmd} = global;
    
    const emit = stub();
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd({
        emit,
    });
    
    const current = create();
    
    currentFile.setCurrentName('hello', current);
    
    t.calledWith(emit, ['current-file', current], 'should call emit');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: setCurrentName: return', (t) => {
    const {DOM, CloudCmd} = global;
    
    const link = {};
    
    global.DOM = getDOM({
        link,
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.setCurrentName('hello', current);
    
    t.equal(result, link, 'should return link');
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: getParentDirPath: result', (t) => {
    const {DOM} = global;
    
    const getCurrentDirPath = returns('/D/Films/+++favorite films/');
    const getCurrentDirName = returns('+++favorite films');
    
    global.DOM = getDOM({
        getCurrentDirPath,
        getCurrentDirName,
    });
    
    const result = currentFile.getParentDirPath();
    const expected = '/D/Films/';
    
    global.DOM = DOM;
    
    t.equal(result, expected, 'should return parent dir path');
    t.end();
});

test('current-file: isCurrentFile: no', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const result = currentFile.isCurrentFile();
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.notOk(result);
    t.end();
});

test('current-file: isCurrentFile', (t) => {
    const {DOM, CloudCmd} = global;
    
    const isContainClass = stub();
    
    global.DOM = getDOM({
        isContainClass,
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = {};
    currentFile.isCurrentFile(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.calledWith(isContainClass, [current, _CURRENT_FILE], 'should call isContainClass');
    t.end();
});

test('current-file: getCurrentType', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const {getByDataName} = global.DOM;
    
    getByDataName.returns({
        className: 'mini-icon directory',
    });
    
    const current = create();
    
    currentFile.getCurrentType(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.calledWith(getByDataName, ['js-type', current]);
    t.end();
});

test('current-file: isCurrentIsDir: getCurrentType', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM();
    global.CloudCmd = getCloudCmd();
    
    const {getCurrentType} = global.DOM;
    
    const current = create();
    
    currentFile.isCurrentIsDir(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.calledWith(getCurrentType, [current]);
    t.end();
});

test('current-file: isCurrentIsDir: directory', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM({
        getCurrentType: stub().returns('directory'),
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.ok(result);
    t.end();
});

test('current-file: isCurrentIsDir: directory-link', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM({
        getCurrentType: stub().returns('directory-link'),
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.ok(result);
    t.end();
});

test('current-file: isCurrentIsDir: file', (t) => {
    const {DOM, CloudCmd} = global;
    
    global.DOM = getDOM({
        getCurrentType: stub().returns('file'),
    });
    
    global.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    global.DOM = DOM;
    global.CloudCmd = CloudCmd;
    
    t.notOk(result);
    t.end();
});

const getCloudCmd = ({emit} = {}) => ({
    prefix: '',
    emit: emit || stub(),
});

test('current-file: parseNameAttribute', (t) => {
    const result = currentFile._parseNameAttribute('js-file-aGVsbG8mbmJzcDt3b3JsZA==');
    const expected = 'hello\xa0world';
    
    t.equal(result, expected);
    t.end();
});

test('current-file: parseHrefAttribute', (t) => {
    const prefix = '/api/v1';
    const result = currentFile._parseHrefAttribute(prefix, '/api/v1/fs/hello&nbsp;world');
    const expected = '/hello\xa0world';
    
    t.equal(result, expected);
    t.end();
});

function getDOM(overrides = {}) {
    const {
        link = {},
        getCurrentDirPath = stub(),
        getCurrentDirName = stub(),
        getByDataName = stub(),
        isContainClass = stub(),
        getCurrentType = stub(),
        getCurrentPath = stub(),
    } = overrides;
    
    return {
        getCurrentDirPath,
        getCurrentDirName,
        getCurrentPath,
        getByDataName,
        isContainClass,
        getCurrentType,
        CurrentInfo: {
            link,
            dirPath: '/',
        },
    };
}
