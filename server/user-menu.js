'use strict';

const {homedir} = require('os');
const fs = require('fs');
const {join} = require('path');
const {promisify} = require('util');

const tryToCatch = require('try-to-catch');
const findUp = require('find-up');

const readFile = promisify(fs.readFile);
const menuName = '.cloudcmd.menu.js';
const homeMenuPath = join(homedir(), menuName);

module.exports = async (req, res, next) => {
    if (req.url.indexOf('/api/v1/user-menu'))
        return next();
    
    const {method} = req;
    
    if (method === 'GET')
        return onGET(req.query, res);
    
    next();
};

async function onGET({dir}, res) {
    const [errorFind, currentMenuPath] = await tryToCatch(findUp, [
        menuName,
    ], {cwd: dir});
    
    if (errorFind && errorFind.code !== 'ENOENT')
        return res
            .status(404)
            .send(e.message);
    
    if (errorFind && errorFind.code === 'ENOENT')
        return res.send('');
    
    const menuPath = currentMenuPath || homeMenuPath;
    const [e, data] = await tryToCatch(readFile, menuPath, 'utf8');
    
    if (!e)
        return res.send(data);
    
    if (e.code !== 'ENOENT')
        return res
            .status(404)
            .send(e.message);
    
    return res.send('');
}

