'use strict';

const fs = require('fs');
const tryCatch = require('try-catch');

const DIR = __dirname + '/../../';
const COMMONDIR = DIR + 'common/';
const TMPLDIR = DIR + 'tmpl/';

const {
    time,
    timeEnd,
} = require(COMMONDIR + 'util');

const CloudFuncPath = COMMONDIR + 'cloudfunc';

const CloudFunc = require(CloudFuncPath);

const test = require('supertape');
const {reRequire} = require('mock-require');

const htmlLooksLike = require('html-looks-like');
const readFilesSync = require('@cloudcmd/read-files-sync');

const FS_DIR = TMPLDIR + 'fs/';
const EXPECT_PATH = __dirname + '/cloudfunc.html';

const addHBS = (a) => `${a}.hbs`;
const TMPL = [
    'file',
    'path',
    'pathLink',
    'link',
].map(addHBS);

const data = {
    path: '/etc/X11/',
    files: [{
        name: 'applnk',
        size: '4.0.0kb',
        date: '21.02.2016',
        uid: 0,
        mode: 'rwx r-x r-x',
        type: 'directory',
    }, {
        name: 'ай',
        size: '1.30kb',
        date: 0,
        uid: 0,
        mode: 'rwx r-x r-x',
        type: 'file',
    }],
};

let Expect =
    '<div data-name="js-path" class="reduce-text" title="/etc/X11/">' +
        '<span data-name="js-copy-path" class="path-icon icon-copy-to-clipboard"' +
        ' title="copy path (Ctrl+P)">' +
        '</span>' +
        '<a data-name="js-refresh" href="/fs/etc/X11/" ' +
        'class="path-icon icon-refresh" title="refresh (Ctrl+R)"></a>' +
        '<span data-name="js-links" class=links>' +
            '<a data-name="js-path-link" href="/fs/" title="/">/</a>' +
            '<a data-name="js-path-link" href="/fs/etc/" title="/etc/">' +
                'etc' +
            '</a>/X11/' +
        '</span>' +
    '</div>';

test('cloudfunc: render', (t) => {
    const template = readFilesSync(FS_DIR, TMPL, 'utf8');
    const expect = fs.readFileSync(EXPECT_PATH, 'utf8');
    
    time('CloudFunc.buildFromJSON');
    const result = CloudFunc.buildFromJSON({
        prefix: '',
        data,
        template,
    });
    
    Expect += expect;
    
    let i;
    const isNotOk = Expect
        .split('')
        .some((item, number) => {
            const ret = result[number] !== item;
            
            if (ret) {
                i = number;
            }
            
            return ret;
        });
    
    timeEnd('CloudFunc.buildFromJSON');
    
    if (isNotOk) {
        console.log(
            `Error in char number: ${i}\n`,
            `Expect: ${Expect.substr(i)}\n`,
            `Result: ${result.substr(i)}`,
        );
        
        console.log('buildFromJSON: Not OK');
    }
    
    t.equal(result, Expect, 'should be equal rendered json data');
    
    htmlLooksLike(result, Expect);
    
    t.end();
});

test('cloudfunc: formatMsg', (t) => {
    const msg = 'hello';
    const name = 'name';
    const status = 'ok';
    
    const result = CloudFunc.formatMsg(msg, name, status);
    
    t.equal(result, 'hello: ok("name")');
    t.end();
});

test('cloudfunc: formatMsg', (t) => {
    const msg = 'hello';
    const name = null;
    const status = 'ok';
    
    const result = CloudFunc.formatMsg(msg, name, status);
    
    t.equal(result, 'hello: ok');
    t.end();
});

test('cloudfunc: getTitle', (t) => {
    const CloudFunc = reRequire(CloudFuncPath);
    
    const result = CloudFunc.getTitle();
    
    t.equal(result, 'Cloud Commander - /');
    t.end();
});

test('cloudfunc: getTitle: no name', (t) => {
    const CloudFunc = reRequire(CloudFuncPath);
    const path = '/hello/world';
    
    const result = CloudFunc.getTitle({
        path,
    });
    
    t.equal(result, 'Cloud Commander - /hello/world');
    t.end();
});

test('cloudfunc: getTitle: name, path', (t) => {
    const CloudFunc = reRequire(CloudFuncPath);
    const name = 'hello';
    const path = '/hello/world';
    
    const result = CloudFunc.getTitle({
        name,
        path,
    });
    
    t.equal(result, 'hello - /hello/world');
    t.end();
});

test('cloudfunc: getHeaderField', (t) => {
    const sort = 'name';
    const order = 'desc';
    const name = 'name';
    
    const result = CloudFunc.getHeaderField(sort, order, name);
    const expected = 'name↓';
    
    t.equal(result, expected, 'should set desc arrow');
    t.end();
});

test('cloudfunc: getPathLink: no url', (t) => {
    const [error] = tryCatch(CloudFunc.getPathLink);
    
    t.ok(error, 'should throw when no url');
    t.end();
});

test('cloudfunc: getPathLink: no template', (t) => {
    const url = 'http://abc.com';
    const prefix = '';
    const [error] = tryCatch(CloudFunc.getPathLink, url, prefix);
    
    t.ok(error, 'should throw when no template');
    t.end();
});

test('cloudfunc: getDotDot', (t) => {
    const dotDot = CloudFunc.getDotDot('/home');
    
    t.equal(dotDot, '/', 'should return root');
    t.end();
});

test('cloudfunc: getDotDot: two levels deep', (t) => {
    const dotDot = CloudFunc.getDotDot('/home/coderaiser/');
    
    t.equal(dotDot, '/home', 'should return up level');
    t.end();
});

