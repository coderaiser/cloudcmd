'use strict';

const {join} = require('path');
const {readFileSync} = require('fs');

const test = require('supertape');
const montag = require('montag');

const {_getSize, getPathLink} = require('./cloudfunc');

const templatePath = join(__dirname, '../tmpl/fs');
const template = {
    pathLink: readFileSync(`${templatePath}/pathLink.hbs`, 'utf8'),
};

test('cloudfunc: getPathLink: /', (t) => {
    const {pathLink} = template;
    const result = getPathLink('/', '', pathLink);
    const expected = montag`
        <a data-name="js-path-link" href="/fs/" title="/">/</a>
    `;
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: getPathLink: /hello/world', (t) => {
    const {pathLink} = template;
    const result = getPathLink('/hello/world', '', pathLink);
    const expected = montag`
        <a data-name="js-path-link" href="/fs/" title="/">/</a>hello/
    `;
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: getPathLink: prefix', (t) => {
    const {pathLink} = template;
    const result = getPathLink('/hello/world', '/cloudcmd', pathLink);
    const expected = montag`
        <a data-name="js-path-link" href="/cloudcmd/fs/" title="/">/</a>hello/
    `;
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: getSize: dir', (t) => {
    const type = 'directory';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;dir&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: link: dir', (t) => {
    const type = 'directory-link';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;link&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: link: file', (t) => {
    const type = 'file-link';
    const size = 0;
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '&lt;link&gt;';
    
    t.equal(result, expected, 'should equal');
    t.end();
});

test('cloudfunc: getSize: file', (t) => {
    const type = 'file';
    const size = '100.00kb';
    const result = _getSize({
        type,
        size,
    });
    
    const expected = '100.00kb';
    
    t.equal(result, expected, 'should equal');
    t.end();
});
