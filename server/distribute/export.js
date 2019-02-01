'use strict';

const currify = require('currify');
const wraptile = require('wraptile');
const squad = require('squad');
const omit = require('object.omit');

const config = require('../config');
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

module.exports = (socket) => {
    if (!config('export'))
        return;
    
    const prefix = config('prefix');
    const distributePrefix = `${prefix}/distribute`;
    
    const onError = squad(
        logWraped(exportStr),
        getMessage,
    );
    
    const onConnectError = squad(logWraped(exportStr), getDescription);
    
    socket.of(distributePrefix)
        .on('connection', onConnection(push))
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

const connectPush = wraptile((push, socket) => {
    socket.emit('accept');
    
    const host = getHost(socket);
    const subscription = push(socket);
    
    socket.on('disconnect', onDisconnect(subscription, host));
    
    log(exportStr, `${connectedStr} to ${host}`);
    socket.emit('config', omitConfig(config('*')));
    log(exportStr, `config send to ${host}`);
    
    config.subscribe(subscription);
});

const onConnection = currify((push, socket) => {
    const host = getHost(socket);
    const reject = () => {
        socket.emit('reject');
        socket.disconnect();
    };
    
    log(exportStr, `${authTryStr} from ${host}`);
    socket.on('auth', auth(connectPush(push, socket), reject));
});

const auth = currify((fn, reject, token) => {
    if (token === config('exportToken'))
        return fn();
    
    reject();
});

const onDisconnect = wraptile((subscription, host) => {
    config.unsubscribe(subscription);
    log(exportStr, `${disconnectedStr} from ${host}`);
});

