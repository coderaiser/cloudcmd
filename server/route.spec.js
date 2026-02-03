import path, {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Readable} from 'node:stream';
import fs from 'node:fs';
import {tryToCatch} from 'try-to-catch';
import {test, stub} from 'supertape';
import serveOnce from 'serve-once';
import cloudcmd from './cloudcmd.js';
import {_getReadDir} from './route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixtureDir = path.join(__dirname, '..', 'test', 'fixture');
const {createConfigManager} = cloudcmd;

const defaultConfig = {
    auth: false,
    dropbox: false,
};

const {request} = serveOnce(cloudcmd, {
    config: defaultConfig,
});

const {stringify} = JSON;
const {assign} = Object;

test('cloudcmd: route: buttons: no console', async (t) => {
    const options = {
        config: {
            console: false,
        },
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.match(body, 'icon-console none', 'should hide console');
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
    
    t.match(body, 'icon-config none', 'should hide config');
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
    
    t.match(body, 'icon-contact none', 'should hide contact');
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
    
    t.match(body, 'icon-move none', 'should hide move button');
    t.end();
});

test('cloudcmd: route: buttons: one file panel: copy', async (t) => {
    const config = {
        oneFilePanel: true,
    };
    
    const options = {
        config,
    };
    
    const {body} = await request.get('/', {
        options,
    });
    
    t.match(body, 'icon-copy none', 'should hide copy button');
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
    
    t.match(body, 'keyspanel hidden', 'should hide keyspanel');
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
    
    t.match(body, 'ENOENT: no such file or directory', 'should return error');
    t.end();
});

test('cloudcmd: route: sendIndex: encode', async (t) => {
    const name = '"><svg onload=alert(3);>';
    const nameEncoded = '&quot;&gt;&lt;svg onload=alert(3);&gt;';
    const path = '/';
    
    const files = [{
        name,
    }];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    assign(stream, {
        path,
        files,
        type: 'directory',
    });
    
    const read = stub().resolves(stream);
    
    cloudcmd.depStore('win32', {
        read,
    });
    
    const {request} = serveOnce(cloudcmd, {
        configManager: createConfigManager(),
    });
    
    const {body} = await request.get('/');
    
    cloudcmd.depStore();
    
    t.match(body, nameEncoded, 'should encode name');
    t.end();
});

test('cloudcmd: route: sendIndex: encode: not encoded', async (t) => {
    const name = '"><svg onload=alert(3);>';
    const path = '/';
    const files = [{
        name,
    }];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    assign(stream, {
        path,
        files,
        type: 'directory',
    });
    
    const read = stub().resolves(stream);
    
    cloudcmd.depStore('win32', {
        read,
    });
    
    const {request} = serveOnce(cloudcmd);
    const {body} = await request.get('/');
    
    cloudcmd.depStore();
    
    t.notOk(body.includes(name), 'should not put not encoded name');
    t.end();
});

test('cloudcmd: route: sendIndex: ddos: render', async (t) => {
    const name = `$$$'&quot;`;
    const path = '/';
    const files = [{
        name,
    }];
    
    const stream = Readable.from(stringify({
        path,
        files,
    }));
    
    assign(stream, {
        path,
        files,
        type: 'directory',
    });
    
    const read = stub().resolves(stream);
    
    cloudcmd.depStore('win32', {
        read,
    });
    const {request} = serveOnce(cloudcmd, {
        config: defaultConfig,
    });
    
    const {status} = await request.get('/');
    
    cloudcmd.depStore();
    
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
    
    t.match(body, 'icon-terminal none', 'should hide terminal');
    t.end();
});

test('cloudcmd: route: no terminal: /fs', async (t) => {
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
    
    t.match(body, 'icon-terminal none', 'should hide terminal');
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
    
    t.match(body, 'icon-terminal none', 'should not enable terminal');
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
    
    const readdir = _getReadDir(config);
    const [e] = await tryToCatch(readdir, '/root');
    
    t.match(e.message, 'API', 'should contain word token in message');
    t.end();
});

test('cloudcmd: route: content length', async (t) => {
    const options = {
        root: fixtureDir,
    };
    
    const {headers} = await request.get('/route.js', {
        options,
    });
    
    const result = headers.get('content-length');
    
    t.ok(result);
    t.end();
});

test('cloudcmd: route: read: root', async (t) => {
    const stream = Readable.from('hello');
    
    stream.contentLength = 5;
    
    const read = stub().returns(stream);
    cloudcmd.depStore('win32', {
        read,
    });
    
    const configManager = createConfigManager();
    const root = '/hello';
    
    configManager('root', root);
    
    const {request} = serveOnce(cloudcmd, {
        configManager,
    });
    
    await request.get('/fs/route.js');
    cloudcmd.depStore();
    
    const expected = ['/hello/route.js', {
        root,
    }];
    
    t.calledWith(read, expected);
    t.end();
});
