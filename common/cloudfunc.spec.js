'use strict';

const {join} = require('path');
const {readFileSync} = require('fs');

const test = require('supertape');
const montag = require('montag');
const cheerio = require('cheerio');

const {
    _getSize,
    getPathLink,
    buildFromJSON,
} = require('./cloudfunc');

const templatePath = join(__dirname, '../tmpl/fs');
const template = {
    pathLink: readFileSync(`${templatePath}/pathLink.hbs`, 'utf8'),
    path: readFileSync(`${templatePath}/path.hbs`, 'utf8'),
    file: readFileSync(`${templatePath}/file.hbs`, 'utf8'),
    link: readFileSync(`${templatePath}/link.hbs`, 'utf8'),
};

test('cloudfunc: buildFromJSON: ..', (t) => {
    const data = {
        path: '/media/',
        files: [{
            date: '30.08.2016',
            mode: 'rwx rwx rwx',
            name: 'floppy',
            owner: 'root',
            size: '7b',
            type: 'directory-link',
        }],
    };
    
    const html = buildFromJSON({
        prefix: '',
        template,
        data,
    });
    
    const $ = cheerio.load(html);
    const el = $('[data-name="js-file-Li4="]');
    const result = el.find('[data-name="js-name"]').text();
    const expected = '..';
    
    t.equal(result, expected);
    t.end();
});

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
