import {homedir} from 'node:os';
import {readFile as _readFile} from 'node:fs/promises';
import {join} from 'node:path';
import montag from 'montag';
import tryToCatch from 'try-to-catch';
import currify from 'currify';
import {putout, codeframe} from 'putout';

// warm up worker cache
transpile('');

const PREFIX = '/api/v1/user-menu';
const DEFAULT_MENU_PATH = new URL('../static/user-menu.js', import.meta.url).pathname;

export default currify(async ({menuName, readFile = _readFile}, req, res, next) => {
    if (!req.url.startsWith(PREFIX))
        return next();
    
    const {method} = req;
    
    if (method === 'GET')
        return await onGET({
            req,
            res,
            menuName,
            readFile,
        });
    
    next();
});

async function onGET({req, res, menuName, readFile}) {
    const {dir} = req.query;
    const url = req.url.replace(PREFIX, '');
    
    if (url === '/default')
        return sendDefaultMenu(res);
    
    const {findUp} = await import('find-up');
    
    const [errorFind, currentMenuPath] = await tryToCatch(findUp, [menuName], {
        cwd: dir,
    });
    
    if (errorFind && errorFind.code !== 'ENOENT')
        return res
            .status(404)
            .send(errorFind.message);
    
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
    return montag`
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

async function transpile(source) {
    return await tryToCatch(putout, source, {
        rules: {
            'nodejs/convert-esm-to-commonjs': 'on',
        },
        plugins: [
            'nodejs',
            'cloudcmd',
        ],
    });
}
