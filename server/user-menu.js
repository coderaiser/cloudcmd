'use strict';

const {homedir} = require('os');
const {readFile} = require('fs/promises');

const {join} = require('path');

const tryToCatch = require('try-to-catch');
const currify = require('currify');
const findUp = require('find-up');
const threadIt = require('thread-it');
const {codeframe} = require('putout');
const putout = threadIt(require.resolve('putout'));

threadIt.init();

// warm up worker cache
transpile('');

const URL = '/api/v1/user-menu';
const DEFAULT_MENU_PATH = join(__dirname, '../static/user-menu.js');

module.exports = currify(async ({menuName}, req, res, next) => {
    if (req.url.indexOf(URL))
        return next();
    
    const {method} = req;
    
    if (method === 'GET')
        return await onGET({
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
    const [e, source] = await tryToCatch(readFile, menuPath, 'utf8');
    
    if (e && e.code !== 'ENOENT')
        return res
            .status(404)
            .send(e.message);
    
    if (e)
        return sendDefaultMenu(res);
    
    const [parseError, result] = await transpile(source);
    
    if (parseError)
        return res
            .type('js')
            .send(getError(parseError, source));
    
    res
        .type('js')
        .send(result.code);
}

function getError(error, source) {
    return `
        const e = Error(\`<pre>${codeframe({
        error,
        source,
        highlightCode: false,
    })}</pre>\`);
        
        e.code = 'frame';
        
        throw e;
    `;
}

function sendDefaultMenu(res) {
    res.sendFile(DEFAULT_MENU_PATH, {
        cacheControl: false,
    });
}

function transpile(source) {
    return tryToCatch(putout, source, {
        plugins: [
            'convert-esm-to-commonjs',
            'strict-mode',
            'cloudcmd',
        ],
    });
}
