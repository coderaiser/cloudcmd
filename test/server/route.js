'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');
const mockRequire = require('mock-require');
const clear = require('clear-module');

const rootDir = path.join(__dirname, '../..');

const routePath = `${rootDir}/server/route`;
const cloudcmdPath = `${rootDir}/server/cloudcmd`;
const beforePath = path.join(__dirname, '../before');

const {connect} = require(beforePath);

const warp = (fn, ...a) => (...b) => fn(...b, ...a);
const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const getStr = (url) => {
    return get(url)
        .then(warp(_pullout, 'string'))
        .catch(console.log);
};

test('cloudcmd: route: buttons: no console', async (t) => {
    const config = {
        console: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-console none/.test(result), 'should hide console');
    t.end();
    
    done();
});

test('cloudcmd: route: buttons: console', async (t) => {
    const config = {
        console: true,
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/icon-console none/.test(result), 'should not hide console');
    t.end();
    
    done();
});

test('cloudcmd: route: buttons: no config', async (t) => {
    const config = {
        configDialog: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-config none/.test(result), 'should hide config');
    t.end();
    
    done();
});

test('cloudcmd: route: buttons: no contact', async (t) => {
    const config = {
        contact: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-contact none/.test(result), 'should hide contact');
    t.end();
    
    done();
});

test('cloudcmd: route: buttons: one panel mode: move', async (t) => {
    const config = {
        oneFilePanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-move none/.test(result), 'should hide move button');
    t.end();
    
    done();
});

test('cloudcmd: route: buttons: one panel mode: move', async (t) => {
    const config = {
        oneFilePanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-copy none/.test(result), 'should hide copy button');
    t.end();
    
    done();
});

test('cloudcmd: route: keys panel: hide', async (t) => {
    const config = {
        keysPanel: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/keyspanel hidden/.test(result), 'should hide keyspanel');
    t.end();
    
    done();
});

test('cloudcmd: route: keys panel', async (t) => {
    const config = {
        keysPanel: true
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.notOk(/keyspanel hidden/.test(result), 'should show keyspanel');
    t.end();
    
    done();
});

test('cloudcmd: route: file: fs', async (t) => {
    const root = path.join(__dirname, '..', 'fixture', 'empty-file');
    const config = {
        root,
    };
    
    const {port, done} = await connect({config});
    const empty = await getStr(`http://localhost:${port}/fs`);
    
    t.equal(empty, '', 'should equal');
    t.end();
    
    done();
});

test('cloudcmd: route: symlink', async (t) => {
    const emptyDir = path.join(__dirname, '..', 'fixture', 'empty-dir');
    const root = path.join(__dirname, '..', 'fixture');
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
    
    done();
});

test('cloudcmd: route: not found', async (t) => {
    const root = path.join(__dirname, '..', 'fixture');
    const config = {
        root,
    };
    
    const {port, done} = await connect({config});
    const data = await getStr(`http://localhost:${port}/fs/file-not-found`);
    
    t.ok(~data.indexOf('ENOENT: no such file or directory'), 'should return error');
    t.end();
    
    done();
});

test('cloudcmd: route: realpath: error', async (t) => {
    const error = 'realpath error';
    const {realpath} = fs;
    
    fs.realpath = (name, fn) => {
        fn(error);
        fs.realpath = realpath;
    };
    
    const root = path.join(__dirname, '..', 'fixture');
    const config = {
        root,
    };
    
    const {port, done} = await connect({config});
    const data = await getStr(`http://localhost:${port}/fs/empty-file`);
    
    t.ok(/^ENOENT/.test(data), 'should return error');
    t.end();
    
    done();
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
    
    clear(routePath);
    clear('../../server/cloudcmd');
    clear(beforePath);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect();
    const data = await getStr(`http://localhost:${port}`);
    
    t.ok(data.includes(nameEncoded), 'should encode name');
    
    clear('flop');
    clear(routePath);
    clear('../../server/cloudcmd');
    clear(beforePath);
    
    done();
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
    clear('../../server/cloudcmd');
    clear(beforePath);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect();
    const data = await getStr(`http://localhost:${port}`);
    
    t.notOk(data.includes(name), 'should not put not encoded name');
    
    clear('flop');
    clear(routePath);
    clear('../../server/cloudcmd');
    clear(beforePath);
    
    done();
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
    
    clear('flop');
    clear(routePath);
    clear(cloudcmdPath);
    clear(beforePath);
    
    done();
    t.end();
});

test('cloudcmd: route: buttons: no terminal', async (t) => {
    const config = {
        terminal: false
    };
    
    const {port, done} = await connect({config});
    const result = await getStr(`http://localhost:${port}`);
    
    t.ok(/icon-terminal none/.test(result), 'should hide terminal');
    
    done();
    t.end();
});

