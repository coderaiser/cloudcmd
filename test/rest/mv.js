'use strict';

const fs = require('fs');

const test = require('tape');
const {promisify} = require('es6-promisify');
const pullout = require('pullout');
const request = require('request');
const {Volume} = require('memfs');
const {ufs} = require('unionfs');
const tryToCatch = require('try-to-catch');
const mockRequire = require('mock-require');
const clean = require('clear-module');

const root = '../../';
const dir = root + 'server/';
const cloudcmdPath = dir + 'cloudcmd';
const restPath = dir + 'rest';
const beforePath = '../before';

const _pullout = promisify(pullout);

const put = promisify((url, json, fn) => {
    fn(null, request.put(url, {
        json,
    }));
});

test('cloudcmd: rest: mv', async (t) => {
    const volume = {
        '/fixture/mv.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
    clean(beforePath);
    clean(cloudcmdPath);
    clean(restPath);
    clean('@cloudcmd/move-files');
    clean('@cloudcmd/rename-files');
    
    mockRequire('fs', unionFS);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect({
        config: {
            root: '/'
        }
    });
    
    const files = {
        from: '/fixture/',
        to: '/fixture/tmp/',
        names: [
            'mv.txt'
        ]
    };
    
    
    const [, result] = await tryToCatch(put, `http://localhost:${port}/api/v1/mv`, files);
    const body = await _pullout(result, 'string');
    
    done();
    mockRequire.stop('fs');
    
    t.equal(body, 'move: ok("["mv.txt"]")', 'should move');
    t.end();
});

test('cloudcmd: rest: mv: rename', async (t) => {
    const volume = {
        '/fixture/mv.txt': 'hello',
        '/fixture/tmp/a.txt': 'a',
    };
    
    const vol = Volume.fromJSON(volume, '/');
    
    const unionFS = ufs
        .use(vol)
        .use(fs);
    
    clean(beforePath);
    clean(cloudcmdPath);
    clean(restPath);
    
    mockRequire('fs', unionFS);
    
    const {connect} = require(beforePath);
    const {port, done} = await connect({
        config: {
            root: '/'
        }
    });
    
    const files = {
        from: '/fixture/mv.txt',
        to: '/fixture/tmp/mv.txt',
    };
    
    const [, result] = await tryToCatch(put, `http://localhost:${port}/api/v1/mv`, files);
    const body = await _pullout(result, 'string');
    
    done();
    mockRequire.stop('fs');
    
    const expected = 'move: ok("{"from":"/fixture/mv.txt","to":"/fixture/tmp/mv.txt"}")';
    
    t.equal(body, expected, 'should move');
    t.end();
});

