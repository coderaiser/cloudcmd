'use strict';

const fs = require('node:fs');
const {join} = require('node:path');

const {test, stub} = require('supertape');

const serveOnce = require('serve-once');
const threadIt = require('thread-it');
const {reRequire} = require('mock-require');

const userMenu = require('./user-menu');
const {request} = serveOnce(userMenu);

const {readFileSync} = fs;

const userMenuPath = join(__dirname, '..', '.cloudcmd.menu.js');
const userMenuFile = readFileSync(userMenuPath, 'utf8');

const fixtureDir = join(__dirname, 'fixture-user-menu');
const fixtureMoveName = join(fixtureDir, 'io-mv.js');
const fixtureMoveFixName = join(fixtureDir, 'io-mv-fix.js');
const fixtureCopyName = join(fixtureDir, 'io-cp.js');
const fixtureCopyFixName = join(fixtureDir, 'io-cp-fix.js');

const fixtureMove = readFileSync(fixtureMoveName, 'utf8');
const fixtureMoveFix = readFileSync(fixtureMoveFixName, 'utf8');
const fixtureCopy = readFileSync(fixtureCopyName, 'utf8');
const fixtureCopyFix = readFileSync(fixtureCopyFixName, 'utf8');

test('cloudcmd: user menu', async (t) => {
    const options = {
        menuName: '.cloudcmd.menu.js',
    };
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    threadIt.terminate();
    
    t.equal(userMenuFile, body);
    t.end();
});

test('cloudcmd: user menu: io.mv', async (t) => {
    const options = {
        menuName: '.cloudcmd.menu.js',
    };
    
    const {readFile} = fs.promises;
    
    fs.promises.readFile = stub().returns(fixtureMove);
    const userMenu = reRequire('./user-menu');
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    threadIt.terminate();
    fs.promises.readFile = readFile;
    
    t.equal(body, fixtureMoveFix);
    t.end();
});

test('cloudcmd: user menu: io.cp', async (t) => {
    const options = {
        menuName: '.cloudcmd.menu.js',
    };
    
    const {readFile} = fs.promises;
    
    fs.promises.readFile = stub().returns(fixtureCopy);
    const userMenu = reRequire('./user-menu');
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    threadIt.terminate();
    fs.promises.readFile = readFile;
    
    t.equal(body, fixtureCopyFix);
    t.end();
});
