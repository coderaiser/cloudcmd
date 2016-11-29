'use strict';

const test = require('tape');
const promisify = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');

const before = require('../before');

const warp = (fn, ...a) => (...b) => fn(...b, ...a);

const _pullout = promisify(pullout);

const get = promisify((url, fn) => {
    fn(null, request(url));
});

const patch = promisify((url, json, fn) => {
    fn(null, request.patch({url, json}));
});

test('cloudcmd: rest: config: get', (t) => {
    before((port, after) => {
        get(`http://localhost:${port}/api/v1/config`)
            .then(warp(_pullout, 'string'))
            .then(JSON.parse)
            .then((config) => {
                t.notOk(config.auth, 'should config.auth to be false');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: config: patch', (t) => {
    const configDialog = true;
    
    before({configDialog}, (port, after) => {
        const json = {
            auth: false,
        };
        
        patch(`http://localhost:${port}/api/v1/config`, json)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.equal(result, 'config: ok("auth")', 'should patch config');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: config: patch: no configDialog', (t) => {
    const config = {
        configDialog: false
    };
    
    before({config}, (port, after) => {
        const json = {
            ip: null
        };
        
        patch(`http://localhost:${port}/api/v1/config`, json)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.equal(result, 'Config is disabled', 'should return error');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: config: patch: no configDialog: statusCode', (t) => {
    const config = {
        configDialog: false
    };
    
    before({config}, (port, after) => {
        const json = {
            ip: null
        };
        
        patch(`http://localhost:${port}/api/v1/config`, json)
            .then((result) => {
                result.on('response', (response) => {
                    t.equal(response.statusCode, 404);
                    t.end();
                    after();
                });
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

test('cloudcmd: rest: config: enabled by default', (t) => {
    before({}, (port, after) => {
        const json = {
            auth: false,
        };
        
        patch(`http://localhost:${port}/api/v1/config`, json)
            .then(warp(_pullout, 'string'))
            .then((result) => {
                t.equal(result, 'config: ok("auth")', 'should patch config');
                t.end();
                after();
            })
            .catch((error) => {
                console.log(error);
            });
    });
});

