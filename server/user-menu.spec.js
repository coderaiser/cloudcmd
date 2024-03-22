'use strict';

const {join} = require('node:path');

const {test, stub} = require('supertape');

const serveOnce = require('serve-once');
const threadIt = require('thread-it');

const userMenu = require('./user-menu');

const {readFileSync} = require('node:fs');
const {request} = serveOnce(userMenu);
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
    
    t.equal(userMenuFile, body);
    t.end();
});

test('cloudcmd: user menu: io.mv', async (t) => {
    const readFile = stub().returns(fixtureMove);
    const options = {
        menuName: '.cloudcmd.menu.js',
        readFile,
    };
    
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    t.equal(body, fixtureMoveFix);
    t.end();
});

test('cloudcmd: user menu: io.cp', async (t) => {
    const readFile = stub().returns(fixtureCopy);
    const options = {
        menuName: '.cloudcmd.menu.js',
        readFile,
    };
    
    const {request} = serveOnce(userMenu);
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    threadIt.terminate();
    
    t.equal(body, fixtureCopyFix);
    t.end();
});
