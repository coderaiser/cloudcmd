import fs from 'node:fs';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {tryToCatch} from 'try-to-catch';
import test from 'supertape';
import serveOnce from 'serve-once';
import {cloudcmd} from '#server/cloudcmd';
import markdown from './index.js';

const config = {
    auth: false,
};

const configManager = cloudcmd.createConfigManager();

const {request} = serveOnce(cloudcmd, {
    config,
    configManager,
});

const fixtureDir = new URL('fixture', import.meta.url).pathname;

const _markdown = promisify(markdown);

test('cloudcmd: markdown: error', async (t) => {
    const {body} = await request.get('/api/v1/markdown/not-found');
    
    t.match(body, 'ENOENT', 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative: error', async (t) => {
    const {body} = await request.get('/api/v1/markdown/not-found?relative');
    
    t.match(body, 'ENOENT', 'should not found');
    t.end();
});

test('cloudcmd: markdown: relative', async (t) => {
    const {body} = await request.get('/api/v1/markdown/HELP.md?relative');
    
    t.notOk(/ENOENT/.test(body), 'should not return error');
    t.end();
});

test('cloudcmd: markdown: put', async (t) => {
    const md = join(fixtureDir, 'markdown.md');
    const html = join(fixtureDir, 'markdown.html');
    
    const mdStream = fs.createReadStream(md);
    const htmlFile = fs.readFileSync(html, 'utf8');
    
    const {body} = await request.put('/api/v1/markdown', {
        body: mdStream,
    });
    
    t.equal(body, htmlFile, 'should render markdown input to html');
    t.end();
});

test('cloudcmd: markdown: put: error', async (t) => {
    const md = join(fixtureDir, 'markdown-not-exist.md');
    
    const name = 'hello';
    const mdStream = fs.createReadStream(md);
    
    mdStream.url = 'http://hello.world';
    mdStream.method = 'PUT';
    
    const [e] = await tryToCatch(_markdown, name, '/', mdStream);
    
    t.match(e.message, 'ENOENT: no such file or directory', 'should emit error');
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

test('cloudcmd: markdown', async (t) => {
    const configManager = cloudcmd.createConfigManager();
    const fixtureDir = new URL('fixture', import.meta.url).pathname;
    const config = {
        auth: false,
        root: fixtureDir,
    };
    
    const {request} = serveOnce(cloudcmd, {
        config,
        configManager,
    });
    
    const {body} = await request.get('/api/v1/markdown/markdown.md');
    
    t.equal(body, '<h1>hello</h1>\n');
    t.end();
});

test('cloudcmd: markdown: zip', async (t) => {
    const configManager = cloudcmd.createConfigManager();
    const fixtureDir = new URL('fixture', import.meta.url).pathname;
    const config = {
        auth: false,
        root: fixtureDir,
    };
    
    const {request} = serveOnce(cloudcmd, {
        config,
        configManager,
    });
    
    const {body} = await request.get('/api/v1/markdown/markdown.zip/markdown.md');
    
    t.equal(body, '<h1>hello</h1>\n');
    t.end();
});
