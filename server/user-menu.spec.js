'use strict';

const fs = require('fs');
const {join} = require('path');

const test = require('supertape');
const serveOnce = require('serve-once');

const userMenu = require('./user-menu');
const {request} = serveOnce(userMenu);

const userMenuPath = join(__dirname, '..', '.cloudcmd.menu.js');
const userMenuFile = fs.readFileSync(userMenuPath, 'utf8');

test('cloudcmd: user menu', async (t) => {
    const options = {
        menuName: '.cloudcmd.menu.js',
    };
    
    const {body} = await request.get(`/api/v1/user-menu?dir=${__dirname}`, {
        options,
    });
    
    t.equal(userMenuFile, body, 'should equal');
    t.end();
});

