'use strict';

const DIR = __dirname + '/';
const DIR_ROOT = DIR + '../';
const DIR_COMMON = DIR + '../common/';

const path = require('path');
const fs = require('fs');

const cloudfunc = require(DIR_COMMON + 'cloudfunc');
const authentication = require(DIR + 'auth');
const config = require(DIR + 'config');
const modulas = require(DIR + 'modulas');
const rest = require(DIR + 'rest');
const route = require(DIR + 'route');
const validate = require(DIR + 'validate');
const prefixer = require(DIR + 'prefixer');
const pluginer = require(DIR + 'plugins');
const terminal = require(DIR + 'terminal');
const distribute = require(DIR + 'distribute');

const currify = require('currify');
const apart = require('apart');
const ponse = require('ponse');
const restafary = require('restafary');
const restbox = require('restbox');
const konsole = require('console-io');
const edward = require('edward');
const dword = require('dword');
const deepword = require('deepword');
const nomine = require('nomine');
const fileop = require('@cloudcmd/fileop');

const isDev = process.env.NODE_ENV === 'development';
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

const getIndexPath = (isDev) => path.join(DIR, '..', `${getDist(isDev)}/index.html`);
const defaultHtml = fs.readFileSync(getIndexPath(isDev), 'utf8');

const auth = currify(_auth);
const root = () => config('root');

const notEmpty = (a) => a;
const clean = (a) => a.filter(notEmpty);

module.exports = (params) => {
    const p = params || {};
    const options = p.config || {};
    const {
        modules,
        plugins,
    } = p;
    
    const keys = Object.keys(options);
    
    checkPlugins(plugins);
    
    keys.forEach((name) => {
        let value = options[name];
        
        if (/root|editor|packer|columns/.test(name))
            validate[name](value);
        
        if (/prefix/.test(name))
            value = prefixer(value);
        
        config(name, value);
    });
    
    config('console', defaultValue('console', options));
    config('configDialog', defaultValue('configDialog', options));
    
    const {prefix} = prefixer(options.prefix);
    const prefixSocket = prefixer(options.prefixSocket);
    
    if (p.socket)
        listen(prefixSocket, p.socket);
    
    return cloudcmd(prefix, plugins, modules);
};

module.exports._getIndexPath = getIndexPath;

function defaultValue(name, options) {
    const value = options[name];
    const previous = config(name);
    
    if (typeof value === 'undefined')
        return previous;
    
    return value;
}

module.exports._getPrefix = getPrefix;
function getPrefix(prefix) {
    if (typeof prefix === 'function')
        return prefix() || '';
    
    return prefix || '';
}

module.exports._auth = _auth;
function _auth(accept, reject, username, password) {
    if (!config('auth'))
        return accept();
    
    const isName = username === config('username');
    const isPass = password === config('password');
    
    if (isName && isPass)
        return accept();
    
    reject();
}

function listen(prefixSocket, socket) {
    prefixSocket = getPrefix(prefixSocket);
    
    config.listen(socket, auth);
    
    edward.listen(socket, {
        root,
        auth,
        prefixSocket: prefixSocket + '/edward',
    });
    
    dword.listen(socket, {
        root,
        auth,
        prefixSocket: prefixSocket + '/dword',
    });
    
    deepword.listen(socket, {
        root,
        auth,
        prefixSocket: prefixSocket + '/deepword',
    });
    
    config('console') && konsole.listen(socket, {
        auth,
        prefixSocket: prefixSocket + '/console',
    });
    
    fileop.listen(socket, {
        root,
        auth,
        prefix: prefixSocket + '/fileop',
    });
    
    config('terminal') && terminal().listen(socket, {
        auth,
        prefix: prefixSocket + '/gritty',
        command: config('terminalCommand'),
        autoRestart: config('terminalAutoRestart'),
    });
    
    distribute.export(socket);
}

function cloudcmd(prefix, plugins, modules) {
    const online = apart(config, 'online');
    const cache = false;
    const diff = apart(config, 'diff');
    const zip = apart(config, 'zip');
    const dir = DIR_ROOT;
    
    const ponseStatic = ponse.static(dir, {cache});
    
    const dropbox = config('dropbox');
    const dropboxToken = config('dropboxToken');
    
    const funcs = clean([
        config('console') && konsole({
            online,
        }),
        
        config('terminal') && terminal({}),
        
        edward({
            online,
            diff,
            zip,
            dropbox,
            dropboxToken,
        }),
        
        dword({
            online,
            diff,
            zip,
            dropbox,
            dropboxToken,
        }),
        
        deepword({
            online,
            diff,
            zip,
            dropbox,
            dropboxToken,
        }),
        
        fileop(),
        
        nomine(),
        
        setUrl,
        setSW,
        logout,
        authentication(),
        config.middle,
        
        modules && modulas(modules),
        
        config('dropbox') && restbox({
            prefix: cloudfunc.apiURL,
            root,
            token: dropboxToken,
        }),
        
        restafary({
            prefix: cloudfunc.apiURL + '/fs',
            root,
        }),
        
        rest,
        route({
            html: defaultHtml,
        }),
        
        pluginer(plugins),
        ponseStatic,
    ]);
    
    return funcs;
}

function logout(req, res, next) {
    if (req.url !== '/logout')
        return next();
    
    res.sendStatus(401);
}

module.exports._replaceDist = replaceDist;
function replaceDist(url) {
    if (!isDev)
        return url;
    
    return url.replace(/^\/dist\//, '/dist-dev/');
}

function setUrl(req, res, next) {
    if (/^\/cloudcmd\.js(\.map)?$/.test(req.url))
        req.url = `/dist${req.url}`;
    
    req.url = replaceDist(req.url);
    
    next();
}

function setSW(req, res, next) {
    const {url} = req;
    const isSW = /^\/sw\.js(\.map)?$/.test(url);
    
    if (isSW)
        req.url = replaceDist(`/dist${url}`);
    
    next();
}

function checkPlugins(plugins) {
    if (typeof plugins === 'undefined')
        return;
    
    if (!Array.isArray(plugins))
        throw Error('plugins should be an array!');
}

