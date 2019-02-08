'use strict';

const DIR = '../';
const DIR_COMMON = DIR + '../common/';

const path = require('path');
const fs = require('fs');

const root = require(DIR + 'root');
const config = require(DIR + 'config');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');
const markdown = require(DIR + 'markdown');
const info = require('./info');

const jaguar = require('jaguar');
const onezip = require('onezip');
const inly = require('inly');
const wraptile = require('wraptile');
const pullout = require('pullout');
const json = require('jonny');
const ponse = require('ponse');

const copymitter = require('copymitter');
const moveFiles = require('@cloudcmd/move-files');

const swap = wraptile((fn, a, b) => fn(b, a));
const isWin32 = process.platform === 'win32';
const {apiURL} = CloudFunc;

module.exports = (request, response, next) => {
    check(request, response, next);
    
    const name = ponse.getPathName(request);
    const regExp = RegExp('^' + apiURL);
    const is = regExp.test(name);
    
    if (!is)
        return next();
    
    rest(request, response);
};

function rest(request, response) {
    const name = ponse.getPathName(request);
    const params = {
        request,
        response,
        name: name.replace(apiURL, '') || '/',
    };
    
    sendData(params, (error, options, data) => {
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
        
        if (error)
            return ponse.sendError(error, params);
        
        ponse.send(data, params);
    });
}

/**
 * getting data on method and command
 *
 * @param params {name, method, body, requrest, response}
 */
function sendData(params, callback) {
    const p = params;
    const isMD = RegExp('^/markdown').test(p.name);
    
    if (isMD)
        return markdown(p.name, p.request, callback);
    
    const {method} = p.request;
    
    switch(method) {
    case 'GET':
        return onGET(params, callback);
    
    case 'PUT':
        return pullout(p.request)
            .then((body) => {
                onPUT(p.name, body, callback);
            })
            .catch(callback);
    }
}

function onGET(params, callback) {
    let cmd;
    const p = params;
    
    if (p.name[0] === '/')
        cmd = p.name.replace('/', '');
    
    if (/^pack/.test(cmd)) {
        cmd = cmd.replace(/^pack/, '');
        streamPack(root(cmd), p.response);
        return;
    }
    
    switch(cmd) {
    case '':
        p.data = json.stringify(info());
        
        callback(null, {name: 'api.json'}, p.data);
        break;
    
    default:
        callback({
            message: 'Not Found',
        });
        break;
    }
}

function getPackReg() {
    if (config('packer') === 'zip')
        return /\.zip$/;
    
    return /\.tar\.gz$/;
}

function streamPack(cmd, response) {
    const noop = () => {};
    const filename = cmd.replace(getPackReg(), '');
    const dir = path.dirname(filename);
    const names = [
        path.basename(filename),
    ];
    
    operation('pack', dir, response, names, noop);
}

function getCMD(cmd) {
    if (cmd[0] === '/')
        return cmd.slice(1);
    
    return cmd;
}

const getMoveMsg = (files) => {
    const data = !files.names ? files : files.names.slice();
    const msg = formatMsg('move', data);
    
    return msg;
};

module.exports._onPUT = onPUT;
function onPUT(name, body, callback) {
    checkPut(name, body, callback);
    
    const cmd = getCMD(name);
    const files = json.parse(body);
    
    switch(cmd) {
    case 'mv': {
        if (!files.from || !files.to)
            return callback(body);
        
        if (isRootAll([files.to, files.from]))
            return callback(getWin32RootMsg());
        
        const msg = getMoveMsg(files);
        const fn = swap(callback, msg);
        
        const from = root(files.from);
        const to = root(files.to);
        const {names} = files;
        
        if (!names)
            return fs.rename(from, to, fn);
        
        return moveFiles(from, to, names)
            .on('error', fn)
            .on('end', fn);
    } case 'cp':
        if (!files.from || !files.names || !files.to)
            return callback(body);
        
        if (isRootAll([files.to, files.from]))
            return callback(getWin32RootMsg());
        
        files.from = root(files.from);
        files.to = root(files.to);
        
        copy(files.from, files.to, files.names, (error) => {
            const msg = formatMsg('copy', files.names);
            callback(error, msg);
        });
        break;
    
    case 'pack':
        if (!files.from)
            return callback(body);
        
        pack(files.from, files.to, files.names, callback);
        break;
    
    case 'extract':
        if (!files.from)
            return callback(body);
        
        extract(files.from, files.to, callback);
        
        break;
    
    default:
        callback();
        break;
    }
}

function pack(from, to, names, fn) {
    from = root(from);
    to = root(to);
    
    if (!names) {
        names = [
            path.basename(from),
        ];
        
        from = path.dirname(from);
    }
    
    operation('pack', from, to, names, fn);
}

function extract(from, to, fn) {
    from = root(from);
    
    if (to)
        to = root(to);
    else
        to = from.replace(/\.tar\.gz$/, '');
    
    operation('extract', from, to, fn);
}

function getPacker(operation) {
    if (operation === 'extract')
        return inly;
    
    if (config('packer') === 'zip')
        return onezip.pack;
    
    return jaguar.pack;
}

function operation(op, from, to, names, fn) {
    if (!fn) {
        fn = names;
        names = [
            path.basename(from),
        ];
    }
    
    const packer = getPacker(op);
    const pack = packer(from, to, names);
    
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

module.exports._isRootWin32 = isRootWin32;
function isRootWin32(path) {
    const isRoot = path === '/';
    const isConfig = config('root') === '/';
    
    return isWin32 && isRoot && isConfig;
}

module.exports._isRootAll = isRootAll;
function isRootAll(names) {
    return names.some(isRootWin32);
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

function check(request, response, next) {
    if (typeof request !== 'object')
        throw Error('request should be an object!');
    
    if (typeof response !== 'object')
        throw Error('response should be an object!');
    
    if (typeof next !== 'function')
        throw Error('next should be a function!');
}

function checkPut(name, body, callback) {
    if (typeof name !== 'string')
        throw Error('name should be a string!');
    
    if (typeof body !== 'string')
        throw Error('body should be a string!');
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function!');
}

