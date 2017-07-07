'use strict';

const DIR = __dirname + '/';
const DIR_ROOT = DIR + '../';

const cloudfunc = require(DIR + 'cloudfunc');
const auth = require(DIR + 'auth');
const config = require(DIR + 'config');
const modulas = require(DIR + 'modulas');
const rest = require(DIR + 'rest');
const route = require(DIR + 'route');
const validate = require(DIR + 'validate');
const prefixer = require(DIR + 'prefixer');
const pluginer = require(DIR + 'plugins');
const terminal = require(DIR + 'terminal');

const currify = require('currify');
const apart = require('apart');
const join = require('join-io');
const ponse = require('ponse');
const restafary = require('restafary/legacy');
const konsole = require('console-io/legacy');
const edward = require('edward/legacy');
const dword = require('dword/legacy');
const deepword = require('deepword/legacy');
const nomine = require('nomine/legacy');
const spero = require('spero/legacy');
const remedy = require('remedy/legacy');
const ishtar = require('ishtar/legacy');
const salam = require('salam/legacy');
const omnes = require('omnes/legacy');
const criton = require('criton');

const setUrl = currify(_setUrl);

const root = () => config('root');

const notEmpty = (a) => a;
const clean = (a) => a.filter(notEmpty);

const isDev = process.env.NODE_ENV === 'development';

function getPrefix(prefix) {
    if (typeof prefix === 'function')
        return prefix() || '';
    
    return prefix || '';
}

module.exports = (params) => {
    const p = params || {};
    const options = p.config || {};
    const plugins = p.plugins;
    const modules = p.modules;
    
    const keys = Object.keys(options);
    
    let prefix;
    
    checkPlugins(plugins);
    
    keys.forEach((name) => {
        let value = options[name];
        
        switch(name) {
        case 'root':
            validate.root(value);
            break;
        case 'editor':
            validate.editor(value);
            break;
        case 'packer':
            validate.packer(value);
            break;
        case 'password':
            /* could be useful when used as middleware */
            value = criton(value, config('algo'));
            break;
        case 'prefix':
            prefix = prefixer(value);
            break;
        }
        
        config(name, value);
    });
    
    config('console', defaultValue('console', options));
    config('configDialog', defaultValue('configDialog', options));
    
    if (p.socket)
        listen(prefix, p.socket);
    
    return cloudcmd(prefix, plugins, modules);
};

function defaultValue(name, options) {
    const value = options[name];
    const previous = config(name);
    
    if (typeof value === 'undefined')
        return previous;
    
    return value;
}

function authCheck(socket, success) {
    if (!config('auth'))
        return success();
    
    socket.on('auth', (name, pass) => {
        const isName = name === config('username');
        const isPass = pass === config('password');
        
        if (!isName || !isPass)
            return socket.emit('reject');
        
        success();
        socket.emit('accept');
    });
}

function listen(prefix, socket) {
    const size = cloudfunc.MAX_SIZE;
    
    prefix = getPrefix(prefix);
    
    config.listen(socket, authCheck);
    
    edward.listen(socket, {
        size,
        root,
        authCheck,
        prefix: prefix + '/edward',
    });
    
    dword.listen(socket, {
        size,
        root,
        authCheck,
        prefix: prefix + '/dword',
    });
    
    deepword.listen(socket, {
        size,
        root,
        authCheck,
        prefix: prefix + '/deepword',
    });
    
    spero.listen(socket, {
        root,
        authCheck,
        prefix: prefix + '/spero',
    });
    
    remedy.listen(socket, {
        root,
        authCheck,
        prefix: prefix + '/remedy',
    });
    
    ishtar.listen(socket, {
        root,
        authCheck,
        prefix: prefix + '/ishtar',
    });
    
    salam.listen(socket, {
        root,
        authCheck,
        prefix: prefix + '/salam',
    });
    
    omnes.listen(socket, {
        root,
        authCheck,
        prefix: prefix + '/omnes',
    });
    
    config('console') && konsole.listen(socket, {
        authCheck,
        prefix: prefix + '/console',
    });
    
    config('terminal') && terminal().listen(socket, {
        authCheck,
        prefix: prefix + '/gritty',
    });
}

function cloudcmd(prefix, plugins, modules) {
    const isOption = (name) => {
        return config(name);
    };
    
    const minify = apart(isOption, 'minify');
    const online = apart(isOption, 'online');
    const cache = apart(isOption, 'cache');
    const diff = apart(isOption, 'diff');
    const zip = apart(isOption, 'zip');
    
    const ponseStatic = ponse.static(DIR_ROOT, {cache});
   
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
        
        spero({
            prefix  : prefix + '/spero',
            online,
        }),
        
        remedy({
            prefix  : prefix + '/remedy',
            online,
        }),
        
        ishtar({
            prefix  : prefix + '/ishtar',
            online,
        }),
        
        salam({
            prefix: prefix + '/salam',
        }),
        
        omnes({
            prefix: prefix + '/omnes',
        }),
        
        nomine({
            prefix: prefix + '/rename',
        }),
        
        setUrl(prefix),
        logout,
        auth(),
        config.middle,
        
        modules && modulas(modules),
        
        restafary({
            prefix: cloudfunc.apiURL + '/fs',
            root
        }),
        
        rest,
        route,
        
        join({
            dir     : DIR_ROOT,
            minify,
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

function _setUrl(pref, req, res, next) {
    const prefix = getPrefix(pref);
    const is = !req.url.indexOf(prefix);
    
    if (!is)
        return next();
    
    req.url = req.url.replace(prefix, '') || '/';
    
    if (/^\/cloudcmd\.js(\.map)?$/.test(req.url))
        req.url = `/dist${req.url}`;
    
    if (isDev)
        req.url = req.url.replace(/^\/dist\//, '/dist-dev/');
    
    next();
}

function checkPlugins(plugins) {
    if (typeof plugins === 'undefined')
        return;
    
    if (!Array.isArray(plugins))
        throw Error('plugins should be an array!');
}

