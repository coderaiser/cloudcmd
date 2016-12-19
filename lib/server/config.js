'use strict';

const DIR_SERVER = __dirname + '/';
const DIR_COMMON = DIR_SERVER + '../../common/';
const DIR = DIR_SERVER + '../../';

const path = require('path');

const exit = require(DIR_SERVER + 'exit');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const pullout = require('pullout/legacy');
const ponse = require('ponse');
const jonny = require('jonny');
const readjson = require('readjson');
const writejson = require('writejson');
const tryCatch = require('try-catch');
const exec = require('execon');
const criton = require('criton');
const HOME = require('os-homedir')();

const apiURL = CloudFunc.apiURL;

const ConfigPath = path.join(DIR, 'json/config.json');
const ConfigHome = path.join(HOME, '.cloudcmd.json');

let config;
let error = tryCatch(() => {
    config = readjson.sync(ConfigHome);
});

if (error) {
    if (error.code !== 'ENOENT')
        console.error('cloudcmd --config ~/.cloudcmd.json:', error.message);
    
    error = tryCatch(() => {
        config = readjson.sync(ConfigPath);
    });
    
    if (error)
        exit('cloudcmd --config', ConfigPath + ':', error.message);
}

module.exports          = manage;
module.exports.save     = save;
module.exports.middle   = middle;
module.exports.listen   = (socket, authCheck) => {
    check(socket, authCheck);
    
    if (!manage('configDialog'))
        return middle;
    
    listen(socket, authCheck);
    
    return middle;
};

function manage(key, value) {
    if (!key)
        return;
        
    if (value === undefined)
        return config[key];
    
    config[key] = value;
}

function save(callback) {
    writejson(ConfigHome, config, callback);
}

function listen(sock, authCheck) {
    const prefix = manage('prefix');
    
    sock.of(prefix + '/config')
        .on('connection', (socket) => {
            const connect = exec.with(connection, socket);
            
            exec.if(!manage('auth'), connect, (fn) => {
                authCheck(socket, fn);
            });
        });
}

function connection(socket) {
    socket.emit('config', config);
    
    socket.on('message', (json) => {
        if (typeof json !== 'object')
            return socket.emit('err', 'Error: Wrong data type!');
            
        cryptoPass(json);
        
        save((error)  => {
            if (error)
                return socket.emit('err', error.message);
            
            const data = traverse(json);
            
            socket.broadcast.send(json);
            socket.send(json);
            socket.emit('log', data);
        });
    });
}

function middle(req, res, next) {
    const noConfigDialog = !manage('configDialog');
    
    if (req.url !== apiURL + '/config')
        return next();
        
    switch(req.method) {
    case 'GET':
        get(req, res, next);
        break;
    
    case 'PATCH':
        if (noConfigDialog)
            return res
                .status(404)
                .send('Config is disabled');
         
        patch(req, res, next);
        break;
    
    default:
        next();
    }
}

function get(req, res) {
    const data = jonny.stringify(config);
    
    ponse.send(data, {
        name    : 'config.json',
        request : req,
        response: res,
        cache   : false
    });
}

function patch(req, res, callback) {
    const options = {
        name    : 'config.json',
        request : req,
        response: res,
        cache   : false
    };
    
    pullout(req, 'string', (error, body) => {
        const json = jonny.parse(body) || {};
        
        if (error)
            return callback(error);
             
        cryptoPass(json);
        
        save((error) => {
            if (error)
                return ponse.sendError(error, options);
            
            const data = traverse(json);
            
            ponse.send(data, options);
        });
    });
}

function traverse(json) {
    let data;
    
    Object.keys(json).forEach((name) => {
        data = CloudFunc.formatMsg('config', name);
        manage(name, json[name]);
    });
    
    return data;
}

function cryptoPass(json) {
    const algo = manage('algo');
    
    if (json && json.password)
        json.password = criton(json.password, algo);
}

function check(socket, authCheck) {
    if (!socket)
        throw Error('socket could not be empty!');
    
    if (authCheck && typeof authCheck !== 'function')
        throw Error('authCheck should be function!');
}

