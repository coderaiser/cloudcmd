'use strict';

var DIR = __dirname + '/';
var DIR_ROOT = DIR + '../';
var DIR_SERVER = DIR + 'server/';

var cloudfunc = require(DIR + 'cloudfunc');

var auth = require(DIR_SERVER + 'auth');
var config = require(DIR_SERVER + 'config');
var rest = require(DIR_SERVER + 'rest');
var route = require(DIR_SERVER + 'route');
var validate = require(DIR_SERVER + 'validate');
var prefixer = require(DIR_SERVER + 'prefixer');

var apart = require('apart');
var join = require('join-io');
var ponse = require('ponse');
var mollify = require('mollify');
var restafary = require('restafary');
var konsole = require('console-io/legacy');
var edward = require('edward/legacy');
var dword = require('dword/legacy');
var deepword = require('deepword/legacy');
var spero = require('spero');
var remedy = require('remedy');
var ishtar = require('ishtar');
var salam = require('salam/legacy');
var criton = require('criton');
    
var root = function() {
    return config('root');
};

var emptyFunc = function(req, res, next) {
    next();
};

emptyFunc.middle    = function() {
    return emptyFunc;
};

function getPrefix(prefix) {
    if (typeof prefix === 'function')
        return prefix() || '';
    
    return prefix || '';
}

module.exports = function(params) {
    var p = params || {};
    var options = p.config || {};
    var keys = Object.keys(options);
    var prefix;
    
    keys.forEach(function(name) {
        var value = options[name];
        
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
    
    return cloudcmd(prefix);
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
        var isName = name === config('username');
        var isPass = pass === config('password');
        
        if (isName && isPass) {
            success();
            socket.emit('accept');
        } else {
            socket.emit('reject');
        }
    });
}

function listen(prefix, socket) {
    var size = cloudfunc.MAX_SIZE;
    
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

function cloudcmd(prefix) {
    var isOption    = function(name) {
        return config(name);
    };
    
    var isMinify = apart(isOption, 'minify');
    var isOnline = apart(isOption, 'online');
    var isCache = apart(isOption, 'cache');
    var isDiff = apart(isOption, 'diff');
    var isZip = apart(isOption, 'zip');
    
    var ponseStatic = ponse.static(DIR_ROOT, {
        cache: isCache
    });
   
    var funcs = [
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
    return function(req, res, next) {
        var prefix = getPrefix(pref);
        var is = !req.url.indexOf(prefix);
        
        if (!is)
            return next();
            
        req.url = req.url.replace(prefix, '') || '/';
        
        if (req.url === '/cloudcmd.js')
            req.url = '/lib/client/cloudcmd.js';
        
        next();
    };
}

