'use strict';

const path = require('path');
const fs = require('fs');
const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const routePath = '../../server/route';
const route = require(routePath);
const before = require('../before');

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

test('cloudcmd: route: no args', (t) => {
    t.throws(route, /req could not be empty!/, 'should throw when no args');
    t.end();
});

test('cloudcmd: route: no res', (t) => {
    const fn = () => route({});
    
    t.throws(fn, /res could not be empty!/, 'should throw when no res');
    t.end();
});

test('cloudcmd: route: no next', (t) => {
    const fn = () => route({}, {});
    
    t.throws(fn, /next should be function!/, 'should throw when no next');
    t.end();
});

test('cloudcmd: route: buttons: no console', (t) => {
    const config = {
        console: false
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-console none/.test(result), 'should hide console');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: console', (t) => {
    const config = {
        console: true,
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.notOk(/icon-console none/.test(result), 'should not hide console');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no terminal', (t) => {
    const config = {
        terminal: false
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-terminal none/.test(result), 'should hide terminal');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no config', (t) => {
    const config = {
        configDialog: false
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-config none/.test(result), 'should hide config');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: no contact', (t) => {
    const config = {
        contact: false
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-contact none/.test(result), 'should hide contact');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: one panel mode: move', (t) => {
    const config = {
        onePanelMode: true
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-move none/.test(result), 'should hide move button');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: buttons: one panel mode: move', (t) => {
    const config = {
        onePanelMode: true
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/icon-copy none/.test(result), 'should hide copy button');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: keys panel: hide', (t) => {
    const config = {
        showKeysPanel: false
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.ok(/keyspanel hidden/.test(result), 'should hide keyspanel');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: keys panel', (t) => {
    const config = {
        showKeysPanel: true
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                t.notOk(/keyspanel hidden/.test(result), 'should show keyspanel');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: no index', (t) => {
    const name = path.join(__dirname, '../../dist/index.html');
    const nameAfter = path.join(__dirname, '../../dist/index1.html');
    
    fs.renameSync(name, nameAfter);
    
    before({}, (port, after) => {
        getStr(`http://localhost:${port}/`)
            .then((result) => {
                console.log(result);
                fs.renameSync(nameAfter, name);
                t.equal(result.indexOf('ENOENT'), 0, 'should not found index.html');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: getIndexPath: production', (t) => {
    const isDev = false;
    const name = path.join(__dirname, '..', '..', 'dist', 'index.html');
    
    t.equal(route._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: route: getIndexPath: development', (t) => {
    const isDev = true;
    const name = path.join(__dirname, '..', '..', 'dist-dev', 'index.html');
    
    t.equal(route._getIndexPath(isDev), name);
    t.end();
});

test('cloudcmd: route: file', (t) => {
    const root = path.join(__dirname, '..', 'fixture', 'empty-file');
    const config = {
        root,
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/fs/`)
            .then((empty) => {
                t.equal(empty, '', 'should equal');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: file: fs', (t) => {
    const root = path.join(__dirname, '..', 'fixture', 'empty-file');
    const config = {
        root,
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/fs`)
            .then((empty) => {
                t.equal(empty, '', 'should equal');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: symlink', (t) => {
    const emptyDir = path.join(__dirname, '..', 'fixture', 'empty-dir');
    const root = path.join(__dirname, '..', 'fixture');
    const symlink = path.join(root, 'symlink-dir');
    
    const config = {
        root,
    };
    
    fs.symlinkSync(emptyDir, symlink);
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/fs/symlink-dir`)
            .then((empty) => {
                t.ok(empty.length, 'should return html document');
                fs.unlinkSync(symlink);
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: not found', (t) => {
    const root = path.join(__dirname, '..', 'fixture');
    const config = {
        root,
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/fs/file-not-found`)
            .then((data) => {
                t.ok(~data.indexOf('ENOENT: no such file or directory'), 'should return error');
                t.end();
                after();
            });
    });
});

test('cloudcmd: route: realpath: error', (t) => {
    const error = 'realpath error';
    const {realpath} = fs;
    
    fs.realpath = (name, fn) => {
        fn(error);
        fs.realpath = realpath;
    };
    
    clean('../before');
    clean(routePath);
    
    const before = require('../before');
    const root = path.join(__dirname, '..', 'fixture');
    const config = {
        root,
    };
    
    before({config}, (port, after) => {
        getStr(`http://localhost:${port}/fs/empty-file`)
            .then((data) => {
                t.ok(/^ENOENT/.test(data), 'should return error');
                t.end();
                after();
            });
    });
});

function clean(path) {
    delete require.cache[require.resolve(path)];
}

