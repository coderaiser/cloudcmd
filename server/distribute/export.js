'use strict';

const currify = require('currify');
const wraptile = require('wraptile');
const squad = require('squad');
const omit = require('object.omit');

const log = require('./log');

const {
    exportStr,
    connectedStr,
    disconnectedStr,
    authTryStr,
    makeColor,
    getMessage,
    getDescription,
    logWraped,
} = log;

const omitList = [
    'auth',
    'username',
    'password',
    'algo',
    'name',
    'ip',
    'port',
    'root',
    'import',
    'importUrl',
    'importToken',
    'export',
    'exportToken',
    'log',
    'configDialog',
];

const omitConfig = (config) => omit(config, omitList);

module.exports = (config, socket) => {
    if (!config('export'))
        return;
    
    const prefix = config('prefix');
    const distributePrefix = `${prefix}/distribute`;
    const isLog = config('log');
    
    const onError = squad(
        logWraped(isLog, exportStr),
        getMessage,
    );
    
    const onConnectError = squad(logWraped(isLog, exportStr), getDescription);
    
    socket.of(distributePrefix)
        .on('connection', onConnection(push, config))
        .on('error', onError)
        .on('connect_error', onConnectError);
};

const push = currify((socket, key, value) => {
    if (omitList.includes(key))
        return;
    
    socket.emit('change', key, value);
});

function getHost(socket) {
    const {remoteAddress} = socket.request.connection;
    
    const {
        name,
        port,
        color,
    } = socket.handshake.query;
    
    if (!name)
        return `${remoteAddress}:${port}`;
    
    const colorName = makeColor(name, color);
    
    return `${colorName} [${remoteAddress}:${port}]`;
}

const connectPush = wraptile((push, config, socket) => {
    socket.emit('accept');
    
    const isLog = config('log');
    const host = getHost(socket);
    const subscription = push(socket);
    
    socket.on('disconnect', onDisconnect(subscription, config, host));
    
    log(isLog, exportStr, `${connectedStr} to ${host}`);
    socket.emit('config', omitConfig(config('*')));
    log(isLog, exportStr, `config send to ${host}`);
    
    config.subscribe(subscription);
});

const onConnection = currify((push, config, socket) => {
    const host = getHost(socket);
    const reject = () => {
        socket.emit('reject');
        socket.disconnect();
    };
    
    const isLog = config('log');
    
    log(isLog, exportStr, `${authTryStr} from ${host}`);
    socket.on('auth', auth(config, reject, connectPush(push, config, socket)));
});

const auth = currify((config, reject, fn, token) => {
    if (token === config('exportToken'))
        return fn();
    
    reject();
});

const onDisconnect = wraptile((subscription, config, host) => {
    const isLog = config('log');
    
    config.unsubscribe(subscription);
    log(isLog, exportStr, `${disconnectedStr} from ${host}`);
});

