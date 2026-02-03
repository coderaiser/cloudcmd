import path, {dirname} from 'node:path';
import fs from 'node:fs';
import Emitter from 'node:events';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import currify from 'currify';
import wraptile from 'wraptile';
import {tryToCatch} from 'try-to-catch';
import pullout from 'pullout';
import ponse from 'ponse';
import jonny from 'jonny';
import jju from 'jju';
import writejson from 'writejson';
import {tryCatch} from 'try-catch';
import criton from 'criton';
import * as CloudFunc from '#common/cloudfunc';
import exit from './exit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DIR_SERVER = `${__dirname}/`;
const isUndefined = (a) => typeof a === 'undefined';
const DIR = `${DIR_SERVER}../`;
const HOME = homedir();

const resolve = Promise.resolve.bind(Promise);
const formatMsg = currify((a, b) => CloudFunc.formatMsg(a, b));

const {apiURL} = CloudFunc;

const key = (a) => Object
    .keys(a)
    .pop();

const ConfigPath = path.join(DIR, 'json/config.json');

const connection = currify(_connection);
const connectionWrapped = wraptile(_connection);
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

export const configPath = path.join(HOME, '.cloudcmd.json');

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

export function createConfig({configPath} = {}) {
    const config = {};
    const changeEmitter = new Emitter();
    
    const configManager = (key, value) => {
        if (key === '*')
            return config;
        
        if (isUndefined(value))
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
        changeEmitter.off('change', fn);
    };
    
    return configManager;
}

const write = (filename, config) => {
    return writejson(filename, config('*'), {
        mode: 0o600,
    });
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
            socket.send(json);
            socket.emit('log', data);
        };
        
        manage
            .write()
            .then(send)
            .catch(emit(socket, 'err'));
    });
}

function listen(manage, sock, auth) {
    const prefix = manage('prefixSocket');
    
    sock
        .of(`${prefix}/config`)
        .on('connection', (socket) => {
            if (!manage('auth'))
                return connection(manage, socket);
            
            const reject = () => socket.emit('reject');
            socket.on('auth', auth(connectionWrapped(manage, socket), reject));
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

export const _cryptoPass = cryptoPass;

function cryptoPass(manage, json) {
    const algo = manage('algo');
    
    if (!json.password)
        return [manage, json];
    
    const password = criton(json.password, algo);
    
    return [
        manage, {
            ...json,
            password,
        },
    ];
}
