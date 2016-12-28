'use strict';

const test = require('tape');
const DIR = '../../';
const Util = require(DIR + 'common/util');

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
    t.throws(Util.getStrBigFirst, /str could not be empty!/, 'should throw when no str');
    t.end();
});

test('getStrBigFirst', (t) => {
    t.equal(Util.getStrBigFirst('hello'), 'Hello', 'should return str');
    t.end();
});

