'use strict';

const fs = require('fs');
const path = require('path');
const test = require('supertape');
const {promisify} = require('util');

const tryToCatch = require('try-to-catch');

const markdown = require('./markdown');

const _markdown = promisify(markdown);
const fixtureDir = path.join(__dirname, 'fixture', 'markdown');
const cloudcmd = require('..');
const config = {
    auth: false,
};

const configManager = cloudcmd.createConfigManager();

const {request} = require('serve-once')(cloudcmd, {
    config,
    configManager,
});

test('cloudcmd: markdown: error', async (t) => {
    const {body} = await request.get('/api/v1/markdown/not-found');
    
    t.ok(/ENOENT/.test(body), 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative: error', async (t) => {
    const {body} = await request.get('/api/v1/markdown/not-found?relative');
    
    t.ok(/ENOENT/.test(body), 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative', async (t) => {
    const {body} = await request.get('/api/v1/markdown/HELP.md?relative');
    
    t.notOk(/ENOENT/.test(body), 'should not return error');
    t.end();
});

test('cloudcmd: markdown: put', async (t) => {
    const md = path.join(fixtureDir, 'markdown.md');
    const html = path.join(fixtureDir, 'markdown.html');
    
    const mdStream = fs.createReadStream(md);
    const htmlFile = fs.readFileSync(html, 'utf8');
    
    const {body} = await request.put('/api/v1/markdown', {
        body: mdStream,
    });
    
    t.equal(body, htmlFile, 'should render markdown input to html');
    t.end();
});

test('cloudcmd: markdown: put: error', async (t) => {
    const md = path.join(fixtureDir, 'markdown-not-exist.md');
    
    const name = 'hello';
    const mdStream = fs.createReadStream(md);
    
    mdStream.url = 'http://hello.world';
    mdStream.method = 'PUT';
    
    const [e] = await tryToCatch(_markdown, name, '/', mdStream);
    
    t.ok(e.message.includes('ENOENT: no such file or directory'), 'should emit error');
    t.end();
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

