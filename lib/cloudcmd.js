'use strict';

const DIR = __dirname + '/';
const DIR_ROOT = DIR + '../';
const DIR_SERVER = DIR + 'server/';
const DIR_COMMON = DIR + '../common/';

const cloudfunc = require(DIR_COMMON + 'cloudfunc');

const auth = require(DIR_SERVER + 'auth');
const config = require(DIR_SERVER + 'config');
const rest = require(DIR_SERVER + 'rest');
const route = require(DIR_SERVER + 'route');
const validate = require(DIR_SERVER + 'validate');
const prefixer = require(DIR_SERVER + 'prefixer');
const pluginer = require(DIR_SERVER + 'plugins');

const apart = require('apart');
const join = require('join-io');
const ponse = require('ponse');
const mollify = require('mollify');
const restafary = require('restafary');
const konsole = require('console-io/legacy');
const edward = require('edward/legacy');
const dword = require('dword/legacy');
const deepword = require('deepword/legacy');
const spero = require('spero');
const remedy = require('remedy');
const ishtar = require('ishtar');
const salam = require('salam/legacy');
const criton = require('criton');

const root = () => config('root');
const emptyFunc = (req, res, next) => next();
emptyFunc.middle = () => emptyFunc;

function getPrefix(prefix) {
    if (typeof prefix === 'function')
        return prefix() || '';
    
    return prefix || '';
}

module.exports = function(params) {
    const p = params || {};
    const options = p.config || {};
    const plugins = p.plugins;
    
    const keys = Object.keys(options);
    let prefix;
    
    checkPlugins(plugins);
    
    keys.forEach(function(name) {
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
    
    config('console', defaultTrue(options.console));
    config('configDialog', defaultTrue(options.configDialog));
    
    if (p.socket)
        listen(prefix, p.socket);
    
    return cloudcmd(prefix, plugins);
};

function defaultTrue(value) {
    if (typeof value === 'undefined')
        return true;
    
    return value;
}

function authCheck(socket, success) {
    if (!config('auth'))
        return success();
    
    socket.on('auth', function(name, pass) {
        const isName = name === config('username');
        const isPass = pass === config('password');
        
        if (isName && isPass) {
            success();
            socket.emit('accept');
        } else {
            socket.emit('reject');
        }
    });
}

function listen(prefix, socket) {
    const size = cloudfunc.MAX_SIZE;
    
    prefix = getPrefix(prefix);
    
    config.listen(socket, authCheck);
    
    edward.listen(socket, {
        size: size,
        root: root,
        prefix: prefix + '/edward',
        authCheck: authCheck
    });
    
    dword.listen(socket, {
        size: size,
        root: root,
        prefix: prefix + '/dword',
        authCheck: authCheck
    });
    
    deepword.listen(socket, {
        size: size,
        root: root,
        prefix: prefix + '/deepword',
        authCheck: authCheck
    });
    
    spero.listen(socket, {
        root: root,
        prefix: prefix + '/spero',
        authCheck: authCheck
    });
    
    remedy.listen(socket, {
        root: root,
        prefix: prefix + '/remedy',
        authCheck: authCheck
    });
    
    ishtar.listen(socket, {
        root: root,
        prefix: prefix + '/ishtar',
        authCheck: authCheck
    });
    
    salam.listen(socket, {
        root: root,
        prefix: prefix + '/salam',
        authCheck: authCheck
    });
    
    config('console') && konsole.listen(socket, {
        prefix: prefix + '/console',
        authCheck: authCheck
    });
}

function cloudcmd(prefix, plugins) {
    const isOption = (name) => {
        return config(name);
    };
    
    const isMinify = apart(isOption, 'minify');
    const isOnline = apart(isOption, 'online');
    const isCache = apart(isOption, 'cache');
    const isDiff = apart(isOption, 'diff');
    const isZip = apart(isOption, 'zip');
    
    const ponseStatic = ponse.static(DIR_ROOT, {
        cache: isCache
    });
   
    const funcs = [
        konsole({
            prefix: prefix + '/console',
            minify: isMinify,
            online: isOnline
        }),
        
        edward({
            prefix  : prefix + '/edward',
            minify  : isMinify,
            online  : isOnline,
            diff    : isDiff,
            zip     : isZip
        }),
       
        dword({
            prefix  : prefix + '/dword',
            minify  : isMinify,
            online  : isOnline,
            diff    : isDiff,
            zip     : isZip
        }),
        
        deepword({
            prefix  : prefix + '/deepword',
            minify  : isMinify,
            online  : isOnline,
            diff    : isDiff,
            zip     : isZip
        }),
        
        spero({
            prefix  : prefix + '/spero',
            minify  : isMinify,
            online  : isOnline
        }),
        
        remedy({
            prefix  : prefix + '/remedy',
            minify  : isMinify,
            online  : isOnline
        }),
        
        ishtar({
            prefix  : prefix + '/ishtar',
            minify  : isMinify,
            online  : isOnline
        }),
        
        salam({
            prefix: prefix + '/salam',
        }),
        
        setUrl(prefix),
        logout,
        auth(),
        config.middle,
        
        restafary({
            prefix  : cloudfunc.apiURL + '/fs',
            root    : root
        }),
        
        rest,
        route,
        
        join({
            dir     : DIR_ROOT,
            minify  : isMinify
        }),
        
        mollify({
            dir : DIR_ROOT,
            is  : isMinify
        }),
        
        pluginer(plugins),
        ponseStatic
    ];
    
    return funcs;
}

function logout(req, res, next) {
    if (req.url !== '/logout')
        return next();
    
    res.sendStatus(401);
}

function setUrl(pref) {
    return (req, res, next) => {
        const prefix = getPrefix(pref);
        const is = !req.url.indexOf(prefix);
        
        if (!is)
            return next();
            
        req.url = req.url.replace(prefix, '') || '/';
        
        if (req.url === '/cloudcmd.js')
            req.url = '/client/cloudcmd.js';
        
        next();
    };
}

function checkPlugins(plugins) {
    if (typeof plugins === 'undefined')
        return;
    
    if (!Array.isArray(plugins))
        throw Error('plugins should be an array!');
}

