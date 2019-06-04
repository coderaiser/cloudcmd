'use strict';

const path = require('path');
const fs = require('fs');

const tryToCatch = require('try-to-catch');
const test = require('supertape');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const fixtureDir = path.join(__dirname, '..', 'test', 'fixture');

const routePath = './route';
const cloudcmdPath = './cloudcmd';

const cloudcmd = require(cloudcmdPath);
const {createConfigManager} = cloudcmd;
const serveOnce = require('serve-once');
const defaultConfig = {
    auth: false,
    dropbox: false,
};

const {request} = serveOnce(cloudcmd, {
    config: defaultConfig,
});

test('cloudcmd: route: buttons: no console', async (t) => {
    const options = {
        config: {
            console: false,
        },
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-console none/.test(body), 'should hide console');
    t.end();
});

test('cloudcmd: route: buttons: user menu: disabled', async (t) => {
    const options = {
        config: {
            userMenu: false,
        },
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-user-menu none/.test(body), 'should hide console');
    t.end();
});

test('cloudcmd: route: buttons: user menu: enabled', async (t) => {
    const options = {
        config: {
            userMenu: true,
        },
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-rename none/.test(body), 'should hide console');
    t.end();
});

test('cloudcmd: route: buttons: console', async (t) => {
    const config = {
        console: true,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.notOk(/icon-console none/.test(body), 'should not hide console');
    t.end();
});

test('cloudcmd: route: buttons: no config', async (t) => {
    const config = {
        configDialog: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-config none/.test(body), 'should hide config');
    t.end();
});

test('cloudcmd: route: buttons: no contact', async (t) => {
    const config = {
        contact: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-contact none/.test(body), 'should hide contact');
    t.end();
});

test('cloudcmd: route: buttons: one file panel: move', async (t) => {
    const config = {
        oneFilePanel: true,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-move none/.test(body), 'should hide move button');
    t.end();
});

test('cloudcmd: route: buttons: no one file panel: move', async (t) => {
    const config = {
        oneFilePanel: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.notOk(/icon-move none/.test(body), 'should not hide move button');
    t.end();
});

test('cloudcmd: route: buttons: one file panel: move', async (t) => {
    const config = {
        oneFilePanel: true,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-copy none/.test(body), 'should hide copy button');
    t.end();
});

test('cloudcmd: route: keys panel: hide', async (t) => {
    const config = {
        keysPanel: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/keyspanel hidden/.test(body), 'should hide keyspanel');
    t.end();
});

test('cloudcmd: route: keys panel', async (t) => {
    const config = {
        keysPanel: true,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.notOk(/keyspanel hidden/.test(body), 'should show keyspanel');
    t.end();
});

test('cloudcmd: route: file: fs', async (t) => {
    const root = path.join(fixtureDir, 'empty-file');
    const config = {
        root,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.equal(body, '', 'should equal');
    t.end();
});

test('cloudcmd: route: symlink', async (t) => {
    const emptyDir = path.join(fixtureDir, 'empty-dir');
    const root = fixtureDir;
    const symlink = path.join(root, 'symlink-dir');
    
    const config = {
        root,
    };
    
    const options = {
        config,
    };
    
    fs.symlinkSync(emptyDir, symlink);
    
    const {body} = await request.get('/fs/symlink-dir', {
        options,
    });
    
    fs.unlinkSync(symlink);
    
    t.ok(body.length, 'should return html document');
    t.end();
});

test('cloudcmd: route: not found', async (t) => {
    const root = fixtureDir;
    const config = {
        root,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/fs/file-not-found', {
        options,
    });
    
    t.ok(~body.indexOf('ENOENT: no such file or directory'), 'should return error');
    t.end();
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
    
    const options = {
        config,
    };
    
    reRequire(routePath);
    const cloudcmd = reRequire(cloudcmdPath);
    
    const {request} = serveOnce(cloudcmd, {
        config: defaultConfig,
    });
    
    const {body} = await request.get('/fs/empty-file', {
        options,
    });
    
    /*eslint require-atomic-updates:0*/
    fs.realpath = realpath;
    
    t.ok(/^ENOENT/.test(body), 'should return error');
    t.end();
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
        read,
    });
    
    reRequire(routePath);
    const cloudcmd = reRequire(cloudcmdPath);
    
    const {request} = serveOnce(cloudcmd, {
        configManager: createConfigManager(),
    });
    
    const {body} = await request.get('/');
    
    mockRequire.stop('flop');
    
    t.ok(body.includes(nameEncoded), 'should encode name');
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
        read,
    });
    
    reRequire(routePath);
    const cloudcmd = reRequire(cloudcmdPath);
    
    const {request} = serveOnce(cloudcmd);
    const {body} = await request.get('/');
    
    mockRequire.stop('flop');
    
    t.notOk(body.includes(name), 'should not put not encoded name');
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
        read,
    });
    
    reRequire(routePath);
    const cloudcmd = reRequire(cloudcmdPath);
    
    const {request} = serveOnce(cloudcmd, {
        config: defaultConfig,
    });
    
    const {status} = await request.get('/');
    
    mockRequire.stop('flop');
    
    t.equal(status, 200, 'should not hang up');
    t.end();
});

test('cloudcmd: route: buttons: no terminal', async (t) => {
    const config = {
        terminal: false,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-terminal none/.test(body), 'should hide terminal');
    t.end();
});

test('cloudcmd: route: no termianl: /fs', async (t) => {
    const config = {
        terminal: false,
    };
    
    const options = {
        config,
        configManager: createConfigManager(),
    };
    
    const {request} = serveOnce(cloudcmd);
    const {body} = await request.get('/fs', {
        options,
    });
    
    t.ok(/icon-terminal none/.test(body), 'should hide terminal');
    t.end();
});

test('cloudcmd: route: buttons: terminal: can not load', async (t) => {
    const config = {
        terminal: true,
        terminalPath: 'xxxxxxxxxxxx',
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.ok(/icon-terminal none/.test(body), 'should not enable terminal');
    t.end();
});

test('cloudcmd: route: buttons: terminal', async (t) => {
    const config = {
        terminal: true,
        terminalPath: 'console-io',
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.notOk(/icon-terminal none/.test(body), 'should not enable terminal');
    t.end();
});

test('cloudcmd: route: buttons: contact', async (t) => {
    const config = {
        contact: true,
    };
    
    const options = {
        config,
    };
    
    const {request} = serveOnce(cloudcmd);
    const {body} = await request.get('/', {
        options,
    });
    
    t.notOk(/icon-contact none/.test(body), 'should enable terminal');
    t.end();
});

test('cloudcmd: route: dropbox', async (t) => {
    const config = createConfigManager();
    config('dropbox', true);
    config('dropboxToken', '');
    
    const {_getReadDir} = reRequire(routePath);
    
    const readdir = _getReadDir(config);
    const [e] = await tryToCatch(readdir, '/root');
    
    t.ok(/token/.test(e.message), 'should contain word token in message');
    t.end();
});

