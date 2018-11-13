'use strict';

const fs = require('fs');
const path = require('path');
const test = require('tape');
const {promisify} = require('util');
const pullout = require('pullout');
const request = require('request');
const tryToCatch = require('try-to-catch');

const markdown = require('./markdown');
const before = require('../test/before');
const {connect} = before;

const _markdown = promisify(markdown);

const fixtureDir = path.join(__dirname, 'fixture', 'markdown');

const get = promisify((url, fn) => {
    fn(null, request(url));
});

test('cloudcmd: markdown: error', async (t) => {
    const {port, done} = await connect();
    
    const [error, data] = await tryToCatch(get, `http://localhost:${port}/api/v1/markdown/not-found`)
    const result = await pullout(data);
    
    await done();
    
    t.notOk(error, 'should not be error');
    t.ok(/ENOENT/.test(result), 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative: error', async (t) => {
    const {port, done} = await connect();
    const [e, data] = await tryToCatch(get, `http://localhost:${port}/api/v1/markdown/not-found?relative`)
    const result = await pullout(data);
    
    await done();
    t.ok(/ENOENT/.test(result), 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative', async (t) => {
    const {port, done} = await connect();
    const data = await get(`http://localhost:${port}/api/v1/markdown/HELP.md?relative`)
    const result = await pullout(data);
    
    await done();
    
    t.notOk(/ENOENT/.test(result), 'should not return error');
    t.end();
});

test('cloudcmd: markdown: put', async (t) => {
    const md = path.join(fixtureDir, 'markdown.md');
    const html = path.join(fixtureDir, 'markdown.html');
    
    const mdStream = fs.createReadStream(md);
    const htmlFile = fs.readFileSync(html, 'utf8');
    
    const {port, done} = await connect();
    const url = `http://localhost:${port}/api/v1/markdown`;
    
    const putStream = mdStream
        .pipe(request.put(url));
    
    const [error, result] = await tryToCatch(pullout, putStream);
    
    await done();
    
    t.notOk(error, 'shoud not be error');
    t.equal(result, htmlFile, 'should render markdown input to html');
    t.end();
});

test('cloudcmd: markdown: put: error', (t) => {
    const md = path.join(fixtureDir, 'markdown-not-exist.md');
    
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

test('cloudcmd: markdown: no name', async (t) => {
    const [e] = await tryToCatch(_markdown);
    
    t.equal(e.message, 'name should be string!', 'should throw when no name');
    t.end();
});

test('cloudcmd: markdown: no request', async (t) => {
    const [e] = await tryToCatch(_markdown, 'hello');
    
    t.equal(e.message, 'request could not be empty!', 'should throw when no request');
    t.end();
});

