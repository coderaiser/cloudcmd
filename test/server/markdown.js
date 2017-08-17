'use strict';

const fs = require('fs');
const path = require('path');
const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const markdown = require('../../server/markdown');

const before = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);
const _markdown = promisify(markdown);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

test('cloudcmd: markdown: error', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/markdown/not-found`)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.ok(/ENOENT/.test(result), 'should not found');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: markdown: relative: error', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/markdown/not-found?relative`)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.ok(/ENOENT/.test(result), 'should not found');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: markdown: relative', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/markdown/HELP.md?relative`)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.notOk(/ENOENT/.test(result), 'should not return error');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: markdown: put', (t) => {
    const dir = path.join(__dirname, 'fixture');
    const md = path.join(dir, 'markdown.md');
    const html = path.join(dir, 'markdown.html');
    
    const mdStream = fs.createReadStream(md);
    const htmlFile = fs.readFileSync(html, 'utf8');
    
    before((port, after) => {
        const url = `http://localhost:${port}/api/v1/markdown`;
        
        const putStream = mdStream
            .pipe(request.put(url));
        
        _pullout(putStream, 'string')
            .then((result) => {
                t.equal(result, htmlFile, 'should render markdown input to html');
                t.end();
                after();
            })
            .catch((error) => {
                t.fail(error.message);
                t.end();
            });
    });
});

test('cloudcmd: markdown: put: error', (t) => {
    const dir = path.join(__dirname, 'fixture');
    const md = path.join(dir, 'markdown-not-exist.md');
    
    const name = 'hello';
    const mdStream = fs.createReadStream(md);
    
    mdStream.url = 'http://hello.world';
    mdStream.method = 'PUT';
    
    _markdown(name, mdStream)
        .then((result) => {
            t.fail(`should fail but: ${result}`);
            t.end();
        })
        .catch((error) => {
            t.ok(error.message.includes('ENOENT: no such file or directory'), 'should emit error');
            t.end();
        });
});

test('cloudcmd: markdown: no name', (t) => {
    t.throws(markdown, /name should be string!/, 'should throw when no name');
    t.end();
});

test('cloudcmd: markdown: no request', (t) => {
    const fn = () => markdown('hello');
    
    t.throws(fn, /request could not be empty!/, 'should throw when no request');
    t.end();
});

test('cloudcmd: markdown: no function', (t) => {
    const fn = () => markdown('hello', {});
    
    t.throws(fn, /callback should be function!/, 'should throw when no callback');
    t.end();
});

