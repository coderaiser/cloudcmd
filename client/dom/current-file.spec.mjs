import {test, stub} from 'supertape';
import {create} from 'auto-globals';
import wraptile from 'wraptile';
import * as currentFile from './current-file.mjs';

const id = (a) => a;

const returns = wraptile(id);
const {_CURRENT_FILE} = currentFile;

test('current-file: setCurrentName: setAttribute', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    const {setAttribute} = current;
    
    currentFile.setCurrentName('hello', current);
    
    t.calledWith(setAttribute, ['data-name', 'js-file-aGVsbG8='], 'should call setAttribute');
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: setCurrentName: setAttribute: cyrillic', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    const {setAttribute} = current;
    
    currentFile.setCurrentName('ай', current);
    
    t.calledWith(setAttribute, ['data-name', 'js-file-JUQwJUIwJUQwJUI5'], 'should call setAttribute');
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
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
    const {DOM, CloudCmd} = globalThis;
    
    const emit = stub();
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd({
        emit,
    });
    
    const current = create();
    
    currentFile.setCurrentName('hello', current);
    
    t.calledWith(emit, ['current-file', current], 'should call emit');
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: setCurrentName: return', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    const link = {};
    
    globalThis.DOM = getDOM({
        link,
    });
    
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.setCurrentName('hello', current);
    
    t.equal(result, link, 'should return link');
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.end();
});

test('current-file: getParentDirPath: result', (t) => {
    const {DOM} = globalThis;
    
    const getCurrentDirPath = returns('/D/Films/+++favorite films/');
    const getCurrentDirName = returns('+++favorite films');
    
    globalThis.DOM = getDOM({
        getCurrentDirPath,
        getCurrentDirName,
    });
    
    const result = currentFile.getParentDirPath();
    const expected = '/D/Films/';
    
    globalThis.DOM = DOM;
    
    t.equal(result, expected, 'should return parent dir path');
    t.end();
});

test('current-file: isCurrentFile: no', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd();
    
    const result = currentFile.isCurrentFile();
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.notOk(result);
    t.end();
});

test('current-file: isCurrentFile', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    const isContainClass = stub();
    
    globalThis.DOM = getDOM({
        isContainClass,
    });
    
    globalThis.CloudCmd = getCloudCmd();
    
    const current = {};
    currentFile.isCurrentFile(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.calledWith(isContainClass, [current, _CURRENT_FILE], 'should call isContainClass');
    t.end();
});

test('current-file: getCurrentType', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd();
    
    const {getByDataName} = globalThis.DOM;
    
    getByDataName.returns({
        className: 'mini-icon directory',
    });
    
    const current = create();
    
    currentFile.getCurrentType(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.calledWith(getByDataName, ['js-type', current]);
    t.end();
});

test('current-file: isCurrentIsDir: getCurrentType', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM();
    globalThis.CloudCmd = getCloudCmd();
    
    const {getCurrentType} = globalThis.DOM;
    
    const current = create();
    
    currentFile.isCurrentIsDir(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.calledWith(getCurrentType, [current]);
    t.end();
});

test('current-file: isCurrentIsDir: directory', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM({
        getCurrentType: stub().returns('directory'),
    });
    
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.ok(result);
    t.end();
});

test('current-file: isCurrentIsDir: directory-link', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM({
        getCurrentType: stub().returns('directory-link'),
    });
    
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
    t.ok(result);
    t.end();
});

test('current-file: isCurrentIsDir: file', (t) => {
    const {DOM, CloudCmd} = globalThis;
    
    globalThis.DOM = getDOM({
        getCurrentType: stub().returns('file'),
    });
    
    globalThis.CloudCmd = getCloudCmd();
    
    const current = create();
    
    const result = currentFile.isCurrentIsDir(current);
    
    globalThis.DOM = DOM;
    globalThis.CloudCmd = CloudCmd;
    
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
        getCurrentPath = stub().returns(''),
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

