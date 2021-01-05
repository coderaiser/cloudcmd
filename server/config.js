'use strict';

const DIR_SERVER = __dirname + '/';
const DIR_COMMON = '../common/';
const DIR = DIR_SERVER + '../';

const path = require('path');
const fs = require('fs');
const Emitter = require('events');
const {homedir} = require('os');

const exit = require(DIR_SERVER + 'exit');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const currify = require('currify');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');
const pullout = require('pullout');
const ponse = require('ponse');
const jonny = require('jonny');
const jju = require('jju');
const writejson = require('writejson');
const tryCatch = require('try-catch');
const criton = require('criton');
const HOME = homedir();

const resolve = Promise.resolve.bind(Promise);
const formatMsg = currify((a, b) => CloudFunc.formatMsg(a, b));

const {apiURL} = CloudFunc;

const key = (a) => Object.keys(a).pop();

const ConfigPath = path.join(DIR, 'json/config.json');
const ConfigHome = path.join(HOME, '.cloudcmd.json');

const connection = currify(_connection);
const connectionWraped = wraptile(_connection);
const middle = currify(_middle);

const readjsonSync = (name) => {
    return jju.parse(fs.readFileSync(name, 'utf8'), {
        mode: 'json',
    });
};

const rootConfig = readjsonSync(ConfigPath);

function read(filename) {
    if (!filename)
        return rootConfig;
    
    const [error, configHome] = tryCatch(readjsonSync, filename);
    
    if (error && error.code !== 'ENOENT')
        exit(`cloudcmd --config ${filename}: ${error.message}`);
    
    return {
        ...rootConfig,
        ...configHome,
    };
}

module.exports.createConfig = createConfig;
module.exports.configPath = ConfigHome;

const manageListen = currify((manage, socket, auth) => {
    if (!manage('configDialog'))
        return middle;
    
    listen(manage, socket, auth);
    
    return middle;
});

function initWrite(filename, configManager) {
    if (filename)
        return write.bind(null, filename, configManager);
    
    return resolve;
}

function createConfig({configPath} = {}) {
    const config = {};
    const changeEmitter = new Emitter();
    
    const configManager = (key, value) => {
        if (key === '*')
            return config;
        
        if (value === undefined)
            return config[key];
        
        config[key] = value;
        changeEmitter.emit('change', key, value);
        
        return `${key} = ${value}`;
    };
    
    Object.assign(config, read(configPath));
    
    configManager.middle = middle(configManager);
    configManager.listen = manageListen(configManager);
    configManager.write = initWrite(configPath, configManager);
    configManager.subscribe = (fn) => {
        changeEmitter.on('change', fn);
    };
    
    configManager.unsubscribe = (fn) => {
        // replace to off on node v10
        changeEmitter.removeListener('change', fn);
    };
    
    return configManager;
}

const write = async (filename, config) => {
    return writejson(filename, config('*'), {mode: 0o600});
};

function _connection(manage, socket) {
    socket.emit('config', manage('*'));
    
    const emit = currify((socket, name, e) => {
        return socket.emit(name, e.message);
    });
    
    socket.on('message', (json) => {
        if (typeof json !== 'object')
            return socket.emit('err', 'Error: Wrong data type!');
        
        traverse(cryptoPass(manage, json));
        
        const send = () => {
            const data = CloudFunc.formatMsg('config', key(json));
            socket.broadcast.send(json);
            socket.send(json);
            socket.emit('log', data);
        };
        
        manage.write()
            .then(send)
            .catch(emit(socket, 'err'));
    });
}

function listen(manage, sock, auth) {
    const prefix = manage('prefixSocket');
    
    sock.of(prefix + '/config')
        .on('connection', (socket) => {
            if (!manage('auth'))
                return connection(manage, socket);
            
            const reject = () => socket.emit('reject');
            socket.on('auth', auth(connectionWraped(manage, socket), reject));
        });
}

async function _middle(manage, req, res, next) {
    const noConfigDialog = !manage('configDialog');
    
    if (req.url !== `${apiURL}/config`)
        return next();
    
    switch(req.method) {
    case 'GET':
        get(manage, req, res);
        break;
    
    case 'PATCH':
        if (noConfigDialog)
            return res
                .status(404)
                .send('Config is disabled');
        
        await patch(manage, req, res);
        break;
    
    default:
        next();
    }
}

function get(manage, request, response) {
    const data = jonny.stringify(manage('*'));
    
    ponse.send(data, {
        name: 'config.json',
        request,
        response,
        cache: false,
    });
}

async function patch(manage, request, response) {
    const name = 'config.json';
    const cache = false;
    const options = {
        name,
        request,
        response,
        cache,
    };
    
    const [e] = await tryToCatch(patchConfig, manage, options);
    
    if (e)
        ponse.sendError(e, options);
}

async function patchConfig(manage, {name, request, response, cache}) {
    const str = await pullout(request);
    const json = jonny.parse(str);
    
    traverse(cryptoPass(manage, json));
    await manage.write();
    
    const msg = formatMsg('config', key(json));
    ponse.send(msg, {
        name,
        request,
        response,
        cache,
    });
}

function traverse([manage, json]) {
    for (const name of Object.keys(json)) {
        manage(name, json[name]);
    }
}

module.exports._cryptoPass = cryptoPass;
function cryptoPass(manage, json) {
    const algo = manage('algo');
    
    if (!json.password)
        return [manage, json];
    
    const password = criton(json.password, algo);
    
    return [manage, {
        ...json,
        password,
    }];
}

