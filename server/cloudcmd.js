'use strict';

const DIR = __dirname + '/';
const DIR_ROOT = DIR + '../';
const DIR_COMMON = DIR + '../common/';

const util = require('util');
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

const currify = require('currify/legacy');
const apart = require('apart');
const join = require('join-io');
const ponse = require('ponse');
const restafary = require('restafary');
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
const setUrl = currify(_setUrl);

const root = () => config('root');

const notEmpty = (a) => a;
const clean = (a) => a.filter(notEmpty);

const noop = () => {};
const deprecateOnePanelMode = (value) => {
    util.deprecate(noop, 'onePanelMode is deprecated, use oneFilePanel instead', 'DP0001')();
    config('oneFilePanel', value);
};

const deprecateLocalStorage = (value) => {
    util.deprecate(noop, 'localStorage is deprecated', 'DP0002')();
    config('localStorage', value);
};

module.exports = (params) => {
    const p = params || {};
    const options = p.config || {};
    const plugins = p.plugins;
    const modules = p.modules;
    
    const keys = Object.keys(options);
    
    checkPlugins(plugins);
    
    keys.forEach((name) => {
        const value = options[name];
        
        if (name === 'localStorage')
            deprecateLocalStorage(value);
        else if (name === 'onePanelMode')
            deprecateOnePanelMode();
        else if (name === 'oneFilePanel')
            config('onePanelMode', value);
        else if (/root|editor|packer|columns/.test(name))
            validate[name](value);
        
        config(name, value);
    });
    
    config('console', defaultValue('console', options));
    config('configDialog', defaultValue('configDialog', options));
    
    const prefix = prefixer(options.prefix);
    
    if (p.socket)
        listen(prefix, p.socket);
    
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

function listen(prefix, socket) {
    prefix = getPrefix(prefix);
    
    config.listen(socket, auth);
    
    edward.listen(socket, {
        root,
        auth,
        prefix: prefix + '/edward',
    });
    
    dword.listen(socket, {
        root,
        auth,
        prefix: prefix + '/dword',
    });
    
    deepword.listen(socket, {
        root,
        auth,
        prefix: prefix + '/deepword',
    });
    
    fileop.listen(socket, {
        root,
        auth,
        prefix: prefix + '/fileop',
    });
    
    config('console') && konsole.listen(socket, {
        auth,
        prefix: prefix + '/console',
    });
    
    config('terminal') && terminal().listen(socket, {
        auth,
        prefix: prefix + '/gritty',
    });
}

function cloudcmd(prefix, plugins, modules) {
    const online = apart(config, 'online');
    const cache = apart(config, 'cache');
    const diff = apart(config, 'diff');
    const zip = apart(config, 'zip');
    const dir = DIR_ROOT;
    
    const ponseStatic = ponse.static(dir, {cache});
   
    const funcs = clean([
        config('console') && konsole({
            prefix: prefix + '/console',
            online,
        }),
        
        config('terminal') && terminal({
            prefix: prefix + '/gritty',
        }),
        
        edward({
            prefix  : prefix + '/edward',
            online,
            diff,
            zip,
        }),
       
        dword({
            prefix  : prefix + '/dword',
            online,
            diff,
            zip,
        }),
        
        deepword({
            prefix  : prefix + '/deepword',
            online,
            diff,
            zip,
        }),
        
        fileop({
            prefix  : prefix + '/fileop',
        }),
        
        nomine({
            prefix: prefix + '/rename',
        }),
        
        setUrl(prefix),
        logout,
        authentication(),
        config.middle,
        
        modules && modulas(modules),
        
        restafary({
            prefix: cloudfunc.apiURL + '/fs',
            root
        }),
        
        rest,
        route({
            html: defaultHtml
        }),
        
        join({
            dir,
        }),
        
        pluginer(plugins),
        ponseStatic
    ]);
    
    return funcs;
}

function logout(req, res, next) {
    if (req.url !== '/logout')
        return next();
    
    res.sendStatus(401);
}

module.exports._replacePrefix = replacePrefix;
function replacePrefix(url, prefix) {
    return url.replace(prefix, '') || '/';
}

module.exports._replaceDist = replaceDist;
function replaceDist(url) {
    if (!isDev)
        return url;
    
    return url.replace(/^\/dist\//, '/dist-dev/');
}

function _setUrl(pref, req, res, next) {
    const prefix = getPrefix(pref);
    const is = !req.url.indexOf(prefix);
    
    if (!is)
        return next();
    
    req.url = replacePrefix(req.url, prefix);
    
    if (/^\/cloudcmd\.js(\.map)?$/.test(req.url))
        req.url = `/dist${req.url}`;
    
    req.url = replaceDist(req.url);
    
    next();
}

function checkPlugins(plugins) {
    if (typeof plugins === 'undefined')
        return;
    
    if (!Array.isArray(plugins))
        throw Error('plugins should be an array!');
}

