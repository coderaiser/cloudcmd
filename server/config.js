'use strict';

const DIR_SERVER = __dirname + '/';
const DIR_COMMON = '../common/';
const DIR = DIR_SERVER + '../';

const path = require('path');
const fs = require('fs');
const Emitter = require('events');
const {promisify} = require('util');
const {homedir} = require('os');

const exit = require(DIR_SERVER + 'exit');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const currify = require('currify');
const wraptile = require('wraptile');
const squad = require('squad');
const tryToCatch = require('try-to-catch');
const pullout = require('pullout');
const ponse = require('ponse');
const jonny = require('jonny');
const jju = require('jju');
const writejson = require('writejson');
const tryCatch = require('try-catch');
const criton = require('criton');
const HOME = homedir();

const manageConfig = squad(traverse, cryptoPass);
const save = promisify(_save);

const formatMsg = currify((a, b) => CloudFunc.formatMsg(a, b));

const {apiURL} = CloudFunc;
const changeEmitter = new Emitter();

const ConfigPath = path.join(DIR, 'json/config.json');
const ConfigHome = path.join(HOME, '.cloudcmd.json');

const readjsonSync = (name) => {
    return jju.parse(fs.readFileSync(name, 'utf8'), {
        mode: 'json',
    });
};

const rootConfig = readjsonSync(ConfigPath);
const key = (a) => Object.keys(a).pop();

const [error, configHome] = tryCatch(readjsonSync, ConfigHome);

if (error && error.code !== 'ENOENT')
    exit(`cloudcmd --config ${ConfigHome}: ${error.message}`);

const config = {
    ...rootConfig,
    ...configHome,
};

const connectionWraped = wraptile(connection);

module.exports = manage;
module.exports.save = save;
module.exports.middle = middle;
module.exports.subscribe = (fn) => {
    changeEmitter.on('change', fn);
};

module.exports.unsubscribe = (fn) => {
    changeEmitter.removeListener('change', fn);
};

module.exports.listen = (socket, auth) => {
    check(socket, auth);
    
    if (!manage('configDialog'))
        return middle;
    
    listen(socket, auth);
    
    return middle;
};

function manage(key, value) {
    if (!key)
        return;
    
    if (key === '*')
        return config;
    
    if (value === undefined)
        return config[key];
    
    config[key] = value;
    
    changeEmitter.emit('change', key, value);
    
    return `${key} = ${value}`;
}

function _save(callback) {
    writejson(ConfigHome, config, {mode: 0o600}, callback);
}

function listen(sock, auth) {
    const prefix = manage('prefixSocket');
    
    sock.of(prefix + '/config')
        .on('connection', (socket) => {
            if (!manage('auth'))
                return connection(socket);
            
            const reject = () => socket.emit('reject');
            socket.on('auth', auth(connectionWraped(socket), reject));
        });
}

function connection(socket) {
    socket.emit('config', config);
    
    const emit = currify((socket, name, e) => {
        return socket.emit(name, e.message);
    });
    
    socket.on('message', (json) => {
        if (typeof json !== 'object')
            return socket.emit('err', 'Error: Wrong data type!');
        
        manageConfig(json);
        
        const send = () => {
            const data = CloudFunc.formatMsg('config', key(json));
            socket.broadcast.send(json);
            socket.send(json);
            socket.emit('log', data);
        };
        
        save()
            .then(send)
            .catch(emit(socket, 'err'));
    });
}

function middle(req, res, next) {
    const noConfigDialog = !manage('configDialog');
    
    if (req.url !== `${apiURL}/config`)
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
        
        patch(req, res);
        break;
    
    default:
        next();
    }
}

function get(request, response) {
    const data = jonny.stringify(config);
    
    ponse.send(data, {
        name    : 'config.json',
        request,
        response,
        cache   : false,
    });
}

async function patch(request, response) {
    const name = 'config.json';
    const cache = false;
    const options = {
        name,
        request,
        response,
        cache,
    };
    
    const [e] = await tryToCatch(patchConfig, options);
    
    if (e)
        ponse.sendError(e, options);
}

async function patchConfig({name, request, response, cache}) {
    const str = await pullout(request);
    const json = jonny.parse(str);
    
    manageConfig(json);
    await save();
    
    const msg = formatMsg('config', key(json));
    ponse.send(msg, {
        name,
        request,
        response,
        cache,
    });
}

function traverse(json) {
    Object.keys(json).forEach((name) => {
        manage(name, json[name]);
    });
}

module.exports._cryptoPass = cryptoPass;
function cryptoPass(json) {
    const algo = manage('algo');
    
    if (!json.password)
        return json;
    
    const password = criton(json.password, algo);
    
    return {
        ...json,
        password,
    };
}

function check(socket, auth) {
    if (!socket)
        throw Error('socket could not be empty!');
    
    if (auth && typeof auth !== 'function')
        throw Error('auth should be function!');
}

