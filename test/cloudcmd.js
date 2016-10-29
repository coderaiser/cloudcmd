const http = require('http');
const fs = require('fs');

const test = require('tape');
const express = require('express');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const put = promisify((options, fn) => {
    fn(null, request.put(options));
});

const cloudcmd = require('..');

const before = (fn) => {
    const app = express();
    const server = http.createServer(app);
    const after = () => {
        server.close();
    };
    
    app.use(cloudcmd({
        config: {
            auth: false,
            root: __dirname
        }
    }));
    
    server.listen(() => {
        fn(server.address().port, after);
    });
};

test('cloudcmd: rest: fs: path', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/fs`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((dir) => {
                t.equal('/', dir.path, 'should dir path be "/"');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: get', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/pack/fixture/pack`)
            .then(_pullout)
            .then((pack) => {
                const fixture = fs.readFileSync(__dirname + '/fixture/pack.tar.gz');
                t.ok(fixture.compare(pack), 'should pack data');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: put: file', (t) => {
    before((port, after) => {
        const name = String(Math.random()) + '.tar.gz';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then(() => {
                const file = fs.readFileSync(__dirname + '/' + name);
                const fixture = fs.readFileSync(__dirname + '/fixture/pack.tar.gz');
                
                fs.unlinkSync(`${__dirname}/${name}`);
                t.ok(fixture.compare(file), 'should create archive');
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: put: response', (t) => {
    before((port, after) => {
        const name = String(Math.random()) + '.tar.gz';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then((msg) => {
                t.equal(msg, 'pack: ok("fixture")', 'should return result message');
                
                fs.unlinkSync(`${__dirname}/${name}`);
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: put: error', (t) => {
    before((port, after) => {
        const options = getPackOptions(port, 'name', [
            'not found'
        ]);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then((msg) => {
                t.ok(/^ENOENT: no such file or directory/.test(msg), 'should return error');
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

function getPackOptions(port, to, names = ['pack']) {
    return {
            url: `http://localhost:${port}/api/v1/pack`,
            json: {
                to,
                names,
                from: '/fixture',
            }
    };
}

