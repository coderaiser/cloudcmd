import fs from 'node:fs';
import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Buffer} from 'node:buffer';
import test from 'supertape';
import criton from 'criton';
import {connect} from '../before.js';
import {createConfig} from '../../server/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configFn = createConfig();
const algo = configFn('algo');

const USERNAME = 'admin';
const PASSWORD = 'hunter2';

const BASIC = Buffer
    .from(`${USERNAME}:${PASSWORD}`)
    .toString('base64');

const fixtureDir = path.join(__dirname, '..', 'fixture');

const put = (port, body) => fetch(`http://localhost:${port}/rename`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
});

const putAuth = (port, body) => fetch(`http://localhost:${port}/rename`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BASIC}`,
    },
    body: JSON.stringify(body),
});

// ── auth bypass (CWE-862) ─────────────────────────────────────────────────────
test('cloudcmd: nomine: unauthenticated PUT /rename: 401', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: true,
            username: USERNAME,
            password: criton(PASSWORD, algo),
            root: fixtureDir,
        },
    });
    
    const {status} = await put(port, {
        dir: fixtureDir,
        from: ['a.txt'],
        to: ['b.txt'],
    });
    
    await done();
    
    t.equal(status, 401);
    t.end();
});

test('cloudcmd: nomine: authenticated PUT /rename: 200', async (t) => {
    const tmpDir = fs.mkdtempSync(path.join(fixtureDir, 'nomine-'));
    fs.writeFileSync(path.join(tmpDir, 'src.txt'), 'hello');
    
    const {port, done} = await connect({
        config: {
            auth: true,
            username: USERNAME,
            password: criton(PASSWORD, algo),
            root: tmpDir,
        },
    });
    
    const {status} = await putAuth(port, {
        dir: tmpDir,
        from: ['src.txt'],
        to: ['dst.txt'],
    });
    
    await done();
    fs.rmSync(tmpDir, {
        recursive: true,
    });
    
    t.equal(status, 200);
    t.end();
});

// ── path traversal (CWE-22) ───────────────────────────────────────────────────
test('cloudcmd: nomine: traversal in from: 404', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const {status} = await put(port, {
        dir: fixtureDir,
        from: ['../outside.txt'],
        to: ['a.txt'],
    });
    
    await done();
    
    t.equal(status, 404);
    t.end();
});

test('cloudcmd: nomine: traversal in from: body contains beyond root', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const res = await put(port, {
        dir: fixtureDir,
        from: ['../outside.txt'],
        to: ['a.txt'],
    });
    
    const body = await res.text();
    
    await done();
    
    t.match(body, 'beyond root', `got: ${body}`);
    t.end();
});

test('cloudcmd: nomine: traversal in to: 404', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const {status} = await put(port, {
        dir: fixtureDir,
        from: ['a.txt'],
        to: ['../escaped.txt'],
    });
    
    await done();
    
    t.equal(status, 404);
    t.end();
});

test('cloudcmd: nomine: traversal in to: body contains beyond root', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const res = await put(port, {
        dir: fixtureDir,
        from: ['a.txt'],
        to: ['../escaped.txt'],
    });
    
    const body = await res.text();
    
    await done();
    
    t.match(body, 'beyond root', `got: ${body}`);
    t.end();
});

test('cloudcmd: nomine: absolute path outside root: 404', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const {status} = await put(port, {
        dir: fixtureDir,
        from: ['/etc/passwd'],
        to: ['/tmp/stolen'],
    });
    
    await done();
    
    t.equal(status, 404);
    t.end();
});

test('cloudcmd: nomine: absolute path outside root: body contains beyond root', async (t) => {
    const {port, done} = await connect({
        config: {
            auth: false,
            root: fixtureDir,
        },
    });
    
    const res = await put(port, {
        dir: fixtureDir,
        from: ['/etc/passwd'],
        to: ['/tmp/stolen'],
    });
    
    const body = await res.text();
    
    await done();
    
    t.match(body, 'beyond root', `got: ${body}`);
    t.end();
});
