'use strict';

const DIR = '../';
const DIR_COMMON = DIR + '../common/';

const path = require('path');
const fs = require('fs');

const root = require(DIR + 'root');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');
const markdown = require(DIR + 'markdown');
const info = require('./info');

const jaguar = require('jaguar');
const onezip = require('onezip');
const inly = require('inly');
const wraptile = require('wraptile');
const currify = require('currify');
const pullout = require('pullout');
const json = require('jonny');
const ponse = require('ponse');

const copymitter = require('copymitter');
const moveFiles = require('@cloudcmd/move-files');

const swap = wraptile((fn, a, b) => fn(b, a));
const isWin32 = process.platform === 'win32';
const {apiURL} = CloudFunc;

const UserError = (msg) => {
    const error = Error(msg);
    error.code = 'EUSER';
    
    return error;
};

module.exports = currify((config, request, response, next) => {
    const name = ponse.getPathName(request);
    const regExp = RegExp('^' + apiURL);
    const is = regExp.test(name);
    
    if (!is)
        return next();
    
    rest(config, request, response);
});

function rest(config, request, response) {
    const name = ponse.getPathName(request);
    const params = {
        request,
        response,
        name: name.replace(apiURL, '') || '/',
    };
    
    sendData(params, config, (error, options, data) => {
        params.gzip = !error;
        
        if (!data) {
            data = options;
            options = {};
        }
        
        if (options.name)
            params.name = options.name;
        
        if (options.gzip !== undefined)
            params.gzip = options.gzip;
        
        if (options.query)
            params.query = options.query;
        
        if (error?.code)
            return ponse.sendError(error, params);
        
        if (error)
            return ponse.sendError(error.stack, params);
        
        ponse.send(data, params);
    });
}

/**
 * getting data on method and command
 *
 * @param params {name, method, body, requrest, response}
 */
function sendData(params, config, callback) {
    const p = params;
    const isMD = /^\/markdown/.test(p.name);
    const rootDir = config('root');
    
    if (isMD)
        return markdown(p.name, rootDir, p.request, callback);
    
    const {method} = p.request;
    
    switch(method) {
    case 'GET':
        return onGET(params, config, callback);
    
    case 'PUT':
        return pullout(p.request)
            .then((body) => {
                onPUT({
                    name: p.name,
                    config,
                    body,
                }, callback);
            })
            .catch(callback);
    }
}

function onGET(params, config, callback) {
    let cmd;
    const p = params;
    const packer = config('packer');
    const prefix = config('prefix');
    const rootDir = config('root');
    
    if (p.name[0] === '/')
        cmd = p.name.replace('/', '');
    
    if (/^pack/.test(cmd)) {
        cmd = cmd.replace(/^pack/, '');
        streamPack(root(cmd, rootDir), p.response, packer);
        return;
    }
    
    switch(cmd) {
    case '':
        p.data = json.stringify(info(prefix));
        
        callback(null, {name: 'api.json'}, p.data);
        break;
    
    default:
        callback({
            message: 'Not Found',
        });
        break;
    }
}

function getPackReg(packer) {
    if (packer === 'zip')
        return /\.zip$/;
    
    return /\.tar\.gz$/;
}

function streamPack(cmd, response, packer) {
    const noop = () => {};
    const filename = cmd.replace(getPackReg(packer), '');
    const dir = path.dirname(filename);
    const names = [
        path.basename(filename),
    ];
    
    operation('pack', packer, dir, response, names, noop);
}

function getCMD(cmd) {
    if (cmd[0] === '/')
        return cmd.slice(1);
    
    return cmd;
}

const getMoveMsg = (names) => {
    const msg = formatMsg('move', names);
    return msg;
};

const getRenameMsg = (from, to) => {
    const msg = formatMsg('rename', {
        from,
        to,
    });
    
    return msg;
};

module.exports._onPUT = onPUT;
function onPUT({name, config, body}, callback) {
    checkPut(name, body, callback);
    
    const cmd = getCMD(name);
    const files = json.parse(body);
    const rootDir = config('root');
    
    switch(cmd) {
    case 'move': {
        const {
            from,
            to,
            names,
        } = files;
        
        if (!from)
            return callback(UserError('"from" should be filled'));
        
        if (!to)
            return callback(UserError('"to" should be filled'));
        
        if (isRootAll(rootDir, [to, from]))
            return callback(getWin32RootMsg());
        
        const msg = getMoveMsg(names);
        const fn = swap(callback, msg);
        
        const fromRooted = root(from, rootDir);
        const toRooted = root(to, rootDir);
        
        return moveFiles(fromRooted, toRooted, names)
            .on('error', fn)
            .on('end', fn);
    } case 'rename':
        return rename(rootDir, files.from, files.to, callback);
    
    case 'copy':
        if (!files.from || !files.names || !files.to)
            return callback(body);
        
        if (isRootAll(rootDir, [files.to, files.from]))
            return callback(getWin32RootMsg());
        
        files.from = root(files.from, rootDir);
        files.to = root(files.to, rootDir);
        
        copy(files.from, files.to, files.names, (error) => {
            const msg = formatMsg('copy', files.names);
            callback(error, msg);
        });
        break;
    
    case 'pack':
        if (!files.from)
            return callback(body);
        
        pack(files.from, files.to, files.names, config, callback);
        break;
    
    case 'extract':
        if (!files.from)
            return callback(body);
        
        extract(files.from, files.to, config, callback);
        
        break;
    
    default:
        callback();
        break;
    }
}

function rename(rootDir, from, to, callback) {
    if (!from)
        return callback(UserError('"from" should be filled'));
    
    if (!to)
        return callback(UserError('"to" should be filled'));
    
    const msg = getRenameMsg(from, to);
    const fn = swap(callback, msg);
    
    const fromRooted = root(from, rootDir);
    const toRooted = root(to, rootDir);
    
    return fs.rename(fromRooted, toRooted, fn);
}

function pack(from, to, names, config, fn) {
    const rootDir = config('root');
    const packer = config('packer');
    
    from = root(from, rootDir);
    to = root(to, rootDir);
    
    if (!names) {
        names = [
            path.basename(from),
        ];
        
        from = path.dirname(from);
    }
    
    operation('pack', packer, from, to, names, fn);
}

function extract(from, to, config, fn) {
    const rootDir = config('root');
    
    from = root(from, rootDir);
    
    if (to)
        to = root(to, rootDir);
    else
        to = from.replace(/\.tar\.gz$/, '');
    
    operation('extract', config('packer'), from, to, fn);
}

function getPacker(operation, packer) {
    if (operation === 'extract')
        return inly;
    
    if (packer === 'zip')
        return onezip.pack;
    
    return jaguar.pack;
}

function operation(op, packer, from, to, names, fn) {
    if (!fn) {
        fn = names;
        names = [
            path.basename(from),
        ];
    }
    
    const packerFn = getPacker(op, packer);
    const pack = packerFn(from, to, names);
    
    pack.on('error', fn);
    
    const [name] = names;
    pack.on('progress', (count) => {
        process.stdout.write(`\r${ op } "${ name }": ${ count }%`);
    });
    
    pack.on('end', () => {
        process.stdout.write('\n');
        
        const name = path.basename(from);
        const msg = formatMsg(op, name);
        
        fn(null, msg);
    });
}

function copy(from, to, names, fn) {
    copymitter(from, to, names)
        .on('error', fn)
        .on('progress', (count) => {
            process.stdout.write(`\r copy ${from} ${to} ${count}%`);
        })
        .on('end', () => {
            process.stdout.write('\n');
            fn();
        });
}

const isRootWin32 = currify((root, path) => {
    const isRoot = path === '/';
    const isConfig = root === '/';
    
    return isWin32 && isRoot && isConfig;
});

module.exports._isRootWin32 = isRootWin32;
module.exports._isRootAll = isRootAll;

function isRootAll(root, names) {
    return names.some(isRootWin32(root));
}

module.exports._getWin32RootMsg = getWin32RootMsg;

function getWin32RootMsg() {
    const message = 'Could not copy from/to root on windows!';
    const error = Error(message);
    
    return error;
}

function parseData(data) {
    const isObj = typeof data === 'object';
    
    if (!isObj)
        return data;
    
    return json.stringify(data);
}

module.exports._formatMsg = formatMsg;

function formatMsg(msg, data, status) {
    const value = parseData(data);
    return CloudFunc.formatMsg(msg, value, status);
}

function checkPut(name, body, callback) {
    if (typeof name !== 'string')
        throw Error('name should be a string!');
    
    if (typeof body !== 'string')
        throw Error('body should be a string!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function!');
}

