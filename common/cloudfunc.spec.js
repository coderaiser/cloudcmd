import {readFileSync} from 'node:fs';
import test from 'supertape';
import {montag} from 'montag';
import * as cheerio from 'cheerio';
import {tryCatch} from 'try-catch';
import {
    _getSize,
    getPathLink,
    buildFromJSON,
    _getDataName,
    dateFormatter,
    formatMsg,
    getTitle,
    getDotDot,
    getHeaderField,
} from '#common/cloudfunc';

const templatePath = new URL('../tmpl/fs', import.meta.url).pathname;

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
    
    const result = el
        .find('[data-name="js-name"]')
        .text();
    
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
    
    t.equal(result, expected);
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
    
    t.equal(result, expected);
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
    
    t.equal(result, expected);
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
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: buildFromJSON: showDotFiles: false', (t) => {
    const data = {
        path: '/media/',
        files: [{
            date: '30.08.2016',
            mode: 'rwx rwx rwx',
            name: '.floppy',
            owner: 'root',
            size: '7b',
            type: 'directory-link',
        }],
    };
    
    const html = buildFromJSON({
        prefix: '',
        template,
        data,
        showDotFiles: false,
    });
    
    const $ = cheerio.load(html);
    const el = $('[data-name="js-file-LmZsb3BweQ=="]');
    
    const result = el
        .find('[data-name="js-name"]')
        .text();
    
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: buildFromJSON: name: {{ }}', (t) => {
    const data = {
        path: '/media/',
        files: [{
            date: '30.08.2016',
            mode: 'rwx rwx rwx',
            name: '{{}}',
            owner: 'root',
            size: '7b',
            type: 'file',
        }],
    };
    
    const html = buildFromJSON({
        prefix: '',
        template,
        data,
        showDotFiles: false,
    });
    
    const $ = cheerio.load(html);
    const el = $('[data-name="js-file-JTdCJTdCJTdEJTdE"]');
    
    const result = el
        .find('[data-name="js-name"]')
        .text();
    
    const expected = '{{}}';
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: _getDataName', (t) => {
    const result = _getDataName('s');
    const expected = 'data-name="js-file-cw==" ';
    
    t.equal(result, expected);
    t.end();
});

test('cloudfunc: formatMsg: name', (t) => {
    const result = formatMsg('hello', 'world');
    const expected = 'hello: ok("world")';
    
    t.equal(result, expected, 'should format message with name');
    t.end();
});

test('cloudfunc: formatMsg: no name', (t) => {
    const result = formatMsg('hello');
    const expected = 'hello: ok';
    
    t.equal(result, expected, 'should format message without name');
    t.end();
});

test('cloudfunc: getTitle: no options', (t) => {
    const result = getTitle();
    
    t.ok(result, 'should return a title string even without options');
    t.end();
});

test('cloudfunc: getTitle: with name', (t) => {
    const result = getTitle({name: 'MyName'});
    
    t.ok(result.includes('MyName'), 'should return title with name');
    t.end();
});

test('cloudfunc: getHeaderField: sort not name', (t) => {
    const result = getHeaderField('size', 'asc', 'name');
    
    t.equal(result, 'name', 'should return plain name when sort does not match');
    t.end();
});

test('cloudfunc: getHeaderField: sort name asc', (t) => {
    const result = getHeaderField('name', 'asc', 'name');
    
    t.equal(result, 'name', 'should return plain name when name asc');
    t.end();
});

test('cloudfunc: getDotDot: root', (t) => {
    const result = getDotDot('/');
    
    t.equal(result, '/', 'should return / for root path');
    t.end();
});

test('cloudfunc: getPathLink: /a/b/c', (t) => {
    const {pathLink} = template;
    const result = getPathLink('/a/b/c/', '', pathLink);
    
    t.ok(result, 'should build path link for 3-segment path');
    t.end();
});

test('cloudfunc: getPathLink: no url', (t) => {
    const [error] = tryCatch(getPathLink);
    
    t.equal(error.message, 'url could not be empty!', 'should throw when url is empty');
    t.end();
});

test('cloudfunc: getPathLink: no template', (t) => {
    const [error] = tryCatch(getPathLink, '/');
    
    t.equal(error.message, 'template could not be empty!', 'should throw when template is empty');
    t.end();
});

test('cloudfunc: getHeaderField: sort name desc', (t) => {
    const result = getHeaderField('name', 'desc', 'name');
    const expected = 'name↓';
    
    t.equal(result, expected, 'should return name with down arrow');
    t.end();
});

test('cloudfunc: getDotDot: normal path', (t) => {
    const result = getDotDot('/hello/world/');
    const expected = '/hello';
    
    t.equal(result, expected, 'should return parent directory');
    t.end();
});

test('cloudfunc: buildFromJSON: formatDate', (t) => {
    const data = {
        path: '/media/',
        files: [{
            date: '30.08.2016',
            mode: 'rwx rwx rwx',
            name: '{{}}',
            owner: 'root',
            size: '7b',
            type: 'file',
        }],
    };
    
    const oldFormatter = dateFormatter();
    
    const formatDate = (str) => {
        const [day, month, year] = str.split('.');
        const date = new Date(year, month - 1, day);
        
        return date.toLocaleDateString('en-US');
    };
    
    dateFormatter(formatDate);
    
    const html = buildFromJSON({
        prefix: '',
        template,
        data,
        showDotFiles: false,
    });
    
    dateFormatter(oldFormatter);
    
    const $ = cheerio.load(html);
    const el = $('[data-name="js-file-JTdCJTdCJTdEJTdE"]');
    
    const result = el
        .find('[data-name="js-date"]')
        .text();
    
    const expected = '8/30/2016';
    
    t.equal(result, expected);
    t.end();
});
