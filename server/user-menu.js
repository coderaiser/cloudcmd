'use strict';

const {homedir} = require('os');
const fs = require('fs');

const {join} = require('path');
const {promisify} = require('util');

const tryToCatch = require('try-to-catch');
const currify = require('currify');
const findUp = require('find-up');

const readFile = promisify(fs.readFile);

const URL = '/api/v1/user-menu';
const DEFAULT_MENU_PATH = join(__dirname, '../static/user-menu.js');

module.exports = currify(async({menuName}, req, res, next) => {
    if (req.url.indexOf(URL))
        return next();
    
    const {method} = req;
    
    if (method === 'GET')
        return onGET({
            req,
            res,
            menuName,
        });
    
    next();
});

async function onGET({req, res, menuName}) {
    const {dir} = req.query;
    const url = req.url.replace(URL, '');
    
    if (url === '/default')
        return sendDefaultMenu(res);
    
    const [errorFind, currentMenuPath] = await tryToCatch(findUp, [
        menuName,
    ], {cwd: dir});
    
    if (errorFind && errorFind.code !== 'ENOENT')
        return res
            .status(404)
            .send(e.message);
    
    const homeMenuPath = join(homedir(), menuName);
    const menuPath = currentMenuPath || homeMenuPath;
    const [e, data] = await tryToCatch(readFile, menuPath, 'utf8');
    
    if (!e)
        return res
            .type('js')
            .send(data);
    
    if (e.code !== 'ENOENT')
        return res
            .status(404)
            .send(e.message);
    
    sendDefaultMenu(res);
}

function sendDefaultMenu(res) {
    res.sendFile(DEFAULT_MENU_PATH, {
        cacheControl: false,
    });
}

