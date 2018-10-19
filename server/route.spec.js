'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');
const {promisify} = require('util');
const pullout = require('pullout');
const request = require('request');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;
const clear = require('clear-module');

const rootDir = path.join(__dirname, '../..');
const fixtureDir = path.join(__dirname, '..', 'test', 'fixture');

const routePath = './route';
const cloudcmdPath = './cloudcmd';
const beforePath = path.join(__dirname, '../test/before');

const {connect} = require(beforePath);

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const getStr = (url) => {
    return get(url)
        .then(warp(_pullout, 'string'))
        .catch(console.error);
};

test('cloudcmd: route: buttons: no console', async (t) => {
    const config = {
        console: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-console none/.test(result), 'should hide console');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: console', async (t) => {
    const config = {
        console: true,
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/icon-console none/.test(result), 'should not hide console');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: no config', async (t) => {
    const config = {
        configDialog: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-config none/.test(result), 'should hide config');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: no contact', async (t) => {
    const config = {
        contact: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-contact none/.test(result), 'should hide contact');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: one file panel: move', async (t) => {
    const config = {
        oneFilePanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-move none/.test(result), 'should hide move button');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: no one file panel: move', async (t) => {
    const config = {
        oneFilePanel: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/icon-move none/.test(result), 'should not hide move button');
    t.end();
    
    await done();
});

test('cloudcmd: route: buttons: one file panel: move', async (t) => {
    const config = {
        oneFilePanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-copy none/.test(result), 'should hide copy button');
    t.end();
    
    await done();
});

test('cloudcmd: route: keys panel: hide', async (t) => {
    const config = {
        keysPanel: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/keyspanel hidden/.test(result), 'should hide keyspanel');
    t.end();
    
    await done();
});

test('cloudcmd: route: keys panel', async (t) => {
    const config = {
        keysPanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/keyspanel hidden/.test(result), 'should show keyspanel');
    t.end();
    
    await done();
});

test('cloudcmd: route: file: fs', async (t) => {
    const root = path.join(fixtureDir, 'empty-file');
    const config = {
        root,
    };
    
    const {port, done} = await connect({config});
    const empty = await getStr(`http://localhost:${port}/fs`);
    
    t.equal(empty, '', 'should equal');
    t.end();
    
    await done();
});

test('cloudcmd: route: symlink', async (t) => {
    const emptyDir = path.join(fixtureDir, 'empty-dir');
    const root = fixtureDir
    const symlink = path.join(root, 'symlink-dir');
    
    const config = {
        root,
    };
    
    fs.symlinkSync(emptyDir, symlink);
    
    const {port, done} = await connect({config});
    const data = await getStr(`http://localhost:${port}/fs/symlink-dir`);
    
    t.ok(data.length, 'should return html document');
    fs.unlinkSync(symlink);
    t.end();
    
    await done();
});

test('cloudcmd: route: not found', async (t) => {
    const root = fixtureDir;
    const config = {
        root,
    };
    
    const {port, done} = await connect({config});
    const data = await getStr(`http://localhost:${port}/fs/file-not-found`);
    
    t.ok(~data.indexOf('ENOENT: no such file or directory'), 'should return error');
    t.end();
    
    await done();
});

test('cloudcmd: route: realpath: error', async (t) => {
    const error = 'realpath error';
    const {realpath} = fs;
    
    fs.realpath = (name, fn) => {
        fn(error);
        fs.realpath = realpath;
    };
    
    const config = {
        root: fixtureDir,
    };
    
    reRequire('./route');
    reRequire('./cloudcmd');
    
    const {connect} = reRequire(beforePath);
    const {port, done} = await connect({config});
    const data = await getStr(`http://localhost:${port}/fs/empty-file`);
    
    fs.realpath = realpath;
    
    t.ok(/^ENOENT/.test(data), 'should return error');
    t.end();
    
    await done();
});

test('cloudcmd: route: sendIndex: encode', async (t) => {
    const name = '"><svg onload=alert(3);>';
    const nameEncoded = '&quot;&gt;&lt;svg&nbsp;onload=alert(3);&gt;';
    const files = [{
        name,
    }];
    
    const read = (path, fn) => fn(null, {
        path,
        files,
    });
    
    mockRequire('flop', {
        read
    });
    
    reRequire(routePath);
    reRequire(cloudcmdPath);
    
    const {connect} = reRequire(beforePath);
    const {port, done} = await connect();
    const data = await getStr(`http://localhost:${port}`);
    
    t.ok(data.includes(nameEncoded), 'should encode name');
    
    mockRequire.stop('flop');
    
    await done();
    t.end();
});

test('cloudcmd: route: sendIndex: encode: not encoded', async (t) => {
    const name = '"><svg onload=alert(3);>';
    const files = [{
        name,
    }];
    
    const read = (path, fn) => fn(null, {
        path,
        files,
    });
    
    mockRequire('flop', {
        read
    });
    
    clear(routePath);
    clear(cloudcmdPath);
    clear(beforePath);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect();
    const data = await getStr(`http://localhost:${port}`);
    
    t.notOk(data.includes(name), 'should not put not encoded name');
    
    mockRequire.stop('flop');
    clear(routePath);
    clear(cloudcmdPath);
    clear(beforePath);
    
    await done();
    t.end();
});

test('cloudcmd: route: sendIndex: ddos: render', async (t) => {
    const name = '$$$\'&quot;';
    const files = [{
        name,
    }];
    
    const read = (path, fn) => fn(null, {
        path,
        files,
    });
    
    mockRequire('flop', {
        read
    });
    
    clear(routePath);
    clear(cloudcmdPath);
    clear(beforePath);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect();
    
    await getStr(`http://localhost:${port}`);
    
    t.pass('should not hang up');
    
    mockRequire.stop('flo');
    clear(routePath);
    clear(cloudcmdPath);
    clear(beforePath);
    
    await done();
    t.end();
});

test('cloudcmd: route: buttons: no terminal', async (t) => {
    const config = {
        terminal: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-terminal none/.test(result), 'should hide terminal');
    
    await done();
    t.end();
});

test('cloudcmd: route: buttons: terminal', async (t) => {
    const config = {
        terminal: true,
        terminalPath: 'gritty',
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/icon-terminal none/.test(result), 'should enable terminal');
    
    await done();
    t.end();
});

