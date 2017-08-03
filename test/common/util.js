'use strict';

const test = require('tape');
const DIR = '../../';
const Util = require(DIR + 'common/util');
const {
    getStrBigFirst,
    kebabToCamelCase,
    findObjByNameInArr,
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

test('getStrBigFirst: args', (t) => {
    t.throws(getStrBigFirst, /str could not be empty!/, 'should throw when no str');
    t.end();
});

test('getStrBigFirst', (t) => {
    t.equal(getStrBigFirst('hello'), 'Hello', 'should return str');
    t.end();
});

test('kebabToCamelCase: args', (t) => {
    t.throws(kebabToCamelCase, /str could not be empty!/, 'should throw when no str');
    t.end();
});

test('kebabToCamelCase', (t) => {
    t.equal(kebabToCamelCase('hello-world'), 'HelloWorld', 'should convert kebab to camel case');
    t.end();
});

test('util: findObjByNameInArr: no array', (t) => {
    t.throws(findObjByNameInArr, /array should be array!/, 'should throw when no array');
    t.end();
});

test('util: findObjByNameInArr: no name', (t) => {
    const fn = () => findObjByNameInArr([]);
    t.throws(fn, /name should be string!/, 'should throw when no name');
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
    
    const array = [
        [
            item,
        ]
    ];
    
    const result = findObjByNameInArr(array, name);
    
    t.equal(result, data, 'should return data');
    t.end();
});

