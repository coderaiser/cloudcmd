'use strict';

const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const configFn = require('../server/config');
const before = require('./before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    fn(null, request(url, options));
});

test('cloudcmd: static', (t) => {
    before({}, (port, after) => {
        const name = 'package.json';
        
        get(`http://localhost:${port}/${name}`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((json) => {
                t.equal(json.name, 'cloudcmd', 'should download file');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: static: not found', (t) => {
    before({}, (port, after) => {
        const name = Math.random();
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', (res) => {
                    t.equal(res.statusCode, 404, 'should return 404');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: prefix: wrong', (t) => {
    const prefix = '/hello';
    const config = {prefix};
    
    before({config}, (port, after) => {
        const name = Math.random();
        
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 404, 'should return 404');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

test('cloudcmd: /cloudcmd.js', (t) => {
    before({}, (port, after) => {
        const name = 'cloudcmd.js';
        
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 200, 'should return OK');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

test('cloudcmd: /cloudcmd.js: auth: access denied', (t) => {
    const config = {
        auth: true
    };
    
    before({config}, (port, after) => {
        const name = 'cloudcmd.js';
        
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 401, 'should return auth');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

test('cloudcmd: /cloudcmd.js: auth: no password', (t) => {
    const config = {
        auth: true
    };
    
    const auth = {
        username: configFn('username'),
    };
    
    before({config}, (port, after) => {
        const name = 'cloudcmd.js';
        
        get(`http://localhost:${port}/${name}`, {auth})
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 401, 'should return auth');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

test('cloudcmd: /cloudcmd.js: auth: access granted', (t) => {
    const config = {
        auth: true
    };
    
    const auth = {
        username: configFn('username'),
        password: configFn('password'),
    };
    
    before({config}, (port, after) => {
        const name = 'cloudcmd.js';
        
        get(`http://localhost:${port}/${name}`, {auth})
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 401, 'should return auth');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

test('cloudcmd: /logout', (t) => {
    before({}, (port, after) => {
        const name = 'logout';
        
        get(`http://localhost:${port}/${name}`)
            .then((res) => {
                res.on('response', ({statusCode}) => {
                    t.equal(statusCode, 401, 'should return 401');
                });
                res.on('end', () => {
                    t.end();
                    after();
                });
            })
            .catch(console.error);
    });
});

