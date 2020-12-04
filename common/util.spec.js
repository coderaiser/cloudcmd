'use strict';

const test = require('supertape');
const {reRequire} = require('mock-require');
const tryCatch = require('try-catch');
const Util = require('./util');

const {
    findObjByNameInArr,
    getRegExp,
    escapeRegExp,
} = Util;

test('getExt: no extension', (t) => {
    const EXT = '';
    const name = 'file-withot-extension';
    const ext = Util.getExt(name);
    
    t.equal(ext, EXT, 'should return "" when extension is none');
    t.end();
});

test('getExt: return extension', (t) => {
    const EXT = '.png';
    const name = 'picture.png';
    const ext = Util.getExt(name);
    
    t.equal(ext, EXT, 'should return ".png" in files "picture.png"');
    t.end();
});

test('util: getExt: no name', (t) => {
    const ext = Util.getExt();
    
    t.equal(ext, '', 'should return empty string');
    t.end();
});

test('util: findObjByNameInArr: no array', (t) => {
    const [error] = tryCatch(findObjByNameInArr);
    
    t.equal(error.message, 'array should be array!', 'should throw when no array');
    t.end();
});

test('util: findObjByNameInArr: no name', (t) => {
    const [error] = tryCatch(findObjByNameInArr, []);
    
    t.equal(error.message, 'name should be string!', 'should throw when no array');
    t.end();
});

test('util: findObjByNameInArr: object', (t) => {
    const name = 'hello';
    const obj = {
        name,
    };
    
    const array = [
        obj,
    ];
    
    const result = findObjByNameInArr(array, name);
    
    t.equal(result, obj, 'should return obj');
    t.end();
});

test('util: findObjByNameInArr: array', (t) => {
    const name = 'hello';
    const data = 'abc';
    const item = {
        name,
        data,
    };
    
    const obj = {
        name: 'world',
    };
    
    const array = [
        name, [
            obj,
            item,
        ],
    ];
    
    const result = findObjByNameInArr(array, name);
    
    t.equal(result, data, 'should return data');
    t.end();
});

test('util: getRegExp', (t) => {
    const reg = getRegExp('hel?o.*');
    
    t.deepEqual(reg, /^hel.?o\..*$/, 'should return regexp');
    t.end();
});

test('util: getRegExp: dots', (t) => {
    const reg = getRegExp('h.*el?o.*');
    
    t.deepEqual(reg, /^h\..*el.?o\..*$/, 'should return regexp');
    t.end();
});

test('util: getRegExp: no', (t) => {
    const reg = getRegExp('');
    
    t.deepEqual(reg, /^$/, 'should return regexp');
    t.end();
});

test('util: escapeRegExp: no str', (t) => {
    t.equal(escapeRegExp(1), 1, 'should equal');
    t.end();
});

test('util: escapeRegExp', (t) => {
    t.equal(escapeRegExp('#hello'), '\\#hello', 'should equal');
    t.end();
});

test('util: scope', (t) => {
    global.window = {};
    
    reRequire('./util');
    
    t.pass('should set window in scope');
    
    delete global.window;
    
    t.end();
});

