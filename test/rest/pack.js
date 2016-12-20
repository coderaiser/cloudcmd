'use strict';

const fs = require('fs');
const path = require('path');

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');
const tar = require('tar-stream');
const gunzip = require('gunzip-maybe');

const before = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const pathTarFixture = path.join(__dirname, '..', 'fixture/pack.tar.gz');
const pathZipFixture = path.join(__dirname, '..', 'fixture/pack.zip');

const fixture = {
    tar: fs.readFileSync(pathTarFixture),
    zip: fs.readFileSync(pathZipFixture),
};

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const put = promisify((options, fn) => {
    fn(null, request.put(options));
});

test('cloudcmd: rest: pack: tar: get', (t) => {
    const config = {packer: 'tar'};
    
    before({config}, (port, after) => {
        get(`http://localhost:${port}/api/v1/pack/fixture/pack`)
            .then((pack) => {
                const extract = tar.extract();
                
                pack.pipe(gunzip()).pipe(extract);
                
                extract.on('entry', (header, stream) => {
                    pullout(stream, 'string', (e, data) => {
                        const file = fs.readFileSync(__dirname + '/../fixture/pack', 'utf8');
                        t.equal(file, data, 'should pack data');
                        t.end();
                        after();
                    });
                });
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: tar: put: file', (t) => {
    const config = {packer: 'tar'};
    
    before({config}, (port, after) => {
        const name = String(Math.random()) + '.tar.gz';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(_pullout)
            .then(() => {
                const file = fs.createReadStream(__dirname + '/../' + name);
                const extract = tar.extract();
                
                file.pipe(gunzip()).pipe(extract);
                
                extract.on('entry', (header, stream) => {
                    pullout(stream, 'string', (e, data) => {
                        const file = fs.readFileSync(__dirname + '/../fixture/pack', 'utf8');
                        fs.unlinkSync(`${__dirname}/../${name}`);
                         
                        t.equal(file, data, 'should create archive');
                        t.end();
                        after();
                    });
                });
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: tar: put: response', (t) => {
    const options = {packer: 'tar'};
    before(options, (port, after) => {
        const name = String(Math.random()) + '.tar.gz';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then((msg) => {
                t.equal(msg, 'pack: ok("fixture")', 'should return result message');
                
                fs.unlinkSync(`${__dirname}/../${name}`);
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: tar: put: error', (t) => {
    const config = {packer: 'tar'};
    
    before({config}, (port, after) => {
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

test('cloudcmd: rest: pack: zip: get', (t) => {
    const config = {packer: 'zip'};
    before({config}, (port, after) => {
        get(`http://localhost:${port}/api/v1/pack/fixture/pack`)
            .then(_pullout)
            .then((pack) => {
                t.equal(pack.length, fixture.zip.length, 'should pack data');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: zip: put: file', (t) => {
    const config = {packer: 'zip'};
    
    before({config}, (port, after) => {
        const name = String(Math.random()) + '.zip';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then(() => {
                const file = fs.readFileSync(__dirname + '/../' + name);
                
                fs.unlinkSync(`${__dirname}/../${name}`);
                t.equal(fixture.zip.length, file.length, 'should create archive');
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: zip: put: response', (t) => {
    const config = {packer: 'zip'};
    
    before({config}, (port, after) => {
        const name = String(Math.random()) + '.zip';
        const options = getPackOptions(port, name);
        
        put(options)
            .then(warp(_pullout, 'string'))
            .then((msg) => {
                t.equal(msg, 'pack: ok("fixture")', 'should return result message');
                
                fs.unlinkSync(`${__dirname}/../${name}`);
                
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: pack: zip: put: error', (t) => {
    const config = {packer: 'zip'};
    before({config}, (port, after) => {
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

