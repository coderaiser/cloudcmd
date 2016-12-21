'use strict';

const DIR = './';
const DIR_COMMON = DIR + '../../common/';
const path = require('path');

const root = require(DIR + 'root');
const config = require(DIR + 'config');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');
const markdown = require(DIR + 'markdown');

const jaguar = require('jaguar/legacy');
const onezip = require('onezip/legacy');
const flop = require('flop');
const pullout = require('pullout/legacy');
const ponse = require('ponse');
const rendy = require('rendy');
const copymitter = require('copymitter');
const json = require('jonny');
const check = require('checkup');

const isWin32 = process.platform === 'win32';

/**
 * rest interface
 *
 * @param request
 * @param response
 * @param callback
 */
module.exports = (request, response, next) => {
    const params  = {
        request     : request,
        response    : response
    };
    
    check
        .type('next', next, 'function')
        .check({
            request: request,
            response: response
        });
    
    const apiURL = CloudFunc.apiURL;
    const name = ponse.getPathName(request);
    const regExp = RegExp('^' + apiURL);
    const is = regExp.test(name);
    
    if (!is)
        return next();
    
    params.name = name.replace(apiURL, '') || '/';
    
    sendData(params, (error, options, data) => {
        params.gzip = !error;
        
        if (!data) {
            data    = options;
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
};

/**
 * getting data on method and command
 *
 * @param params {name, method, body, requrest, response}
 */
function sendData(params, callback) {
    const p = params;
    const isMD = RegExp('^/markdown').test(p.name);
    
    if (isMD)
        return markdown(p.name, p.request, (error, data) => {
            callback(error, data);
        });
    
    switch(p.request.method) {
    case 'GET':
        onGET(params, callback);
        break;
    
    case 'PUT':
        pullout(p.request, 'string', (error, body) => {
            if (error)
                return callback(error);
            
            onPUT(p.name, body, callback);
        });
        break;
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
        p.data = json.stringify({
            info: 'Cloud Commander API v1'
        });
        
        callback(null, {name: 'api.json'}, p.data);
        break;
    
    default:
        callback({
            message: 'Not Found'
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
        path.basename(filename)
    ];
    
    operation('pack', dir, response, names, noop);
}

function onPUT(name, body, callback) {
    let cmd;
    
    check
        .type('callback', callback, 'function')
        .check({
            name: name,
            body: body
        });
    
    if (name[0] === '/')
        cmd = name.replace('/', '');
    
    const files = json.parse(body);
    
    switch(cmd) {
    case 'mv':
        if (!files.from || !files.to)
            return callback(body);
        
        if (isRootAll([files.to, files.from]))
            return callback(getWin32RootMsg());
            
        files.from = root(files.from);
        files.to = root(files.to);
        
        copyFiles(files, flop.move, (error) => {
            const data = !files.names ? files : files.names.slice();
            const msg = formatMsg('move', data);
            
            callback(error, msg);
        });
        
        break;
    
    case 'cp':
        if (!files.from || !files.names || !files.to)
            return callback(body);
        
        if (isRootAll([files.to, files.from]))
            return callback(getWin32RootMsg());
            
        files.from  = root(files.from);
        files.to    = root(files.to);
        
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
            path.basename(from)
        ];
        
        from = path.dirname(from);
    }
    
    operation('pack', from, to, names, fn);
}

function extract(from, to, fn) {
    from = root(from);
    
    if (to)
        to  = root(to);
    else
        to = from.replace(/\.tar\.gz$/, '');
    
    operation('extract', from, to, fn);
}

function getPacker() {
    if (config('packer') === 'zip')
        return onezip;
    
    return jaguar;
}

function operation(op, from, to, names, fn) {
    if (!fn) {
        fn      = names;
        names   = [
            path.basename(from)
        ];
    }
    
    const packer = getPacker()[op](from, to, names);
    
    packer.on('error', error => {
        fn(error);
    });
    
    packer.on('progress', (count) => {
        process.stdout.write(rendy('\r{{ operation }} "{{ name }}": {{ count }}%', {
            operation   : op,
            name        : names[0],
            count       : count
        }));
    });
    
    packer.on('end', () => {
        process.stdout.write('\n');
        
        const name = path.basename(from);
        const msg = formatMsg(op, name);
        
        fn(null, msg);
    });
}

function copy(from, to, names, fn) {
    let error;
    const cp = copymitter(from, to, names);
     
    cp.on('error', e => {
        error = e;
        cp.abort();
    });
    
    cp.on('progress', (count) => {
        process.stdout.write(`\r copy ${from} ${to} ${count}%`);
    });
    
    cp.on('end', () => {
        process.stdout.write('\n');
        fn(error);
    });
}

function copyFiles(files, processFunc, callback) {
    let names = files.names;
    
    const copy = () => {
        let isLast;
        let name;
        let from = files.from;
        let to = files.to;
        
        if (names) {
            isLast  = !names.length;
            name    = names.shift();
            from    += name;
            to      += name;
        } else {
            isLast  = false;
            names   = [];
        }
        
        if (isLast)
            return callback();
        
        processFunc(from, to, error => {
            if (error)
                return callback(error);
            
            copy();
        });
    };
    
    check
        .type('callback', callback, 'function')
        .type('processFunc', processFunc, 'function')
        .check({
            files: files
        });
    
    copy();
}

function isRootWin32(path) {
    const isRoot = path === '/';
    const isConfig = config('root') === '/';

    return isWin32 && isRoot && isConfig;
}

function isRootAll(names) {
    return names.some((name) => {
        return isRootWin32(name);
    });
}

function getWin32RootMsg() {
    const message = 'Could not copy from/to root on windows!';
    const error = Error(message);
    
    return error;
}

function formatMsg(msgParam, dataParam, status) {
    let data;
    const isObj = typeof dataParam === 'object';
    
    if (isObj)
        data = json.stringify(dataParam);
    else
        data = dataParam;
    
    return CloudFunc.formatMsg(msgParam, data, status);
}

