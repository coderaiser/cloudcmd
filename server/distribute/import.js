import currify from 'currify';
import wraptile from 'wraptile';
import squad from 'squad';
import {fullstore} from 'fullstore';
import io from 'socket.io-client';
import _forEachKey from 'for-each-key';
import log from './log.js';
import * as env from '../env.js';

const isUndefined = (a) => typeof a === 'undefined';

const noop = () => {};
const forEachKey = currify(_forEachKey);

const {
    importStr,
    connectedStr,
    disconnectedStr,
    tokenRejectedStr,
    authTryStr,
    getMessage,
    getDescription,
    logWrapped,
} = log;

const {entries} = Object;

const equal = (a, b) => `${a}=${b}`;
const append = currify((obj, a, b) => obj.value += b && equal(a, b) + '&');

const wrapApply = (f, disconnect) => (status) => () => f(null, {
    status,
    disconnect,
});

const closeIfNot = wraptile((socket, is) => !is && socket.close());
const addUrl = currify((url, a) => `${url}: ${a}`);

const rmListeners = wraptile((socket, listeners) => {
    socket.removeListener('connect', listeners.onConnect);
    socket.removeListener('accept', listeners.onAccept);
    socket.removeListener('config', listeners.onConfig);
    socket.removeListener('error', listeners.onError);
    socket.removeListener('connect_error', listeners.onConnectError);
    socket.removeListener('reject', listeners.onReject);
    
    if (listeners.onChange)
        socket.removeListener('change', listeners.onChange);
});

const canceled = (f) => f(null, {
    status: 'canceled',
    disconnect: noop,
});

const done = wraptile((fn, store) => fn(null, {
    status: store(),
}));

const emitAuth = wraptile((importUrl, config, socket) => {
    const isLog = config('log');
    log(isLog, importStr, `${authTryStr} to ${importUrl}`);
    socket.emit('auth', config('importToken'));
});

const updateConfig = currify((config, data) => {
    for (const [key, value] of entries(data)) {
        if (!isUndefined(env.parse(key)))
            continue;
        
        config(key, value);
    }
});

export const distributeImport = (config, options, fn) => {
    fn = fn || options;
    
    if (!config('import'))
        return canceled(fn);
    
    const importUrl = config('importUrl');
    const importListen = config('importListen');
    const name = config('name');
    const port = config('port');
    const isLog = config('log');
    
    const query = toLine({
        name,
        port,
    });
    
    const url = `${importUrl}/distribute?${query}`;
    
    const socket = io.connect(url, {
        ...options,
        rejectUnauthorized: false,
    });
    
    const superFn = wrapApply(fn, socket.close.bind(socket));
    const colorUrl = importUrl;
    const close = closeIfNot(socket, importListen);
    
    const statusStore = fullstore();
    const statusStoreWrapped = wraptile(statusStore);
    
    const onConfig = squad(close, logWrapped(isLog, importStr, `config received from ${colorUrl}`), statusStoreWrapped('received'), updateConfig(config));
    
    const onError = squad(superFn('error'), logWrapped(isLog, config, importStr), addUrl(colorUrl), getMessage);
    
    const onConnectError = squad(superFn('connect_error'), logWrapped(isLog, importStr), addUrl(colorUrl), getDescription);
    
    const onConnect = emitAuth(importUrl, config, socket);
    const onAccept = logWrapped(isLog, importStr, `${connectedStr} to ${colorUrl}`);
    const onChange = squad(logWrapped(isLog, importStr), config);
    
    const onReject = squad(superFn('reject'), logWrapped(
        isLog,
        importStr,
        tokenRejectedStr,
    ));
    
    const onDisconnect = squad(...[
        done(fn, statusStore),
        logWrapped(isLog, importStr, `${disconnectedStr} from ${colorUrl}`),
        rmListeners(socket, {
            onConnect,
            onAccept,
            onConfig,
            onError,
            onConnectError,
            onReject,
            onChange,
        }),
    ]);
    
    socket.on('connect', onConnect);
    socket.on('accept', onAccept);
    socket.on('disconnect', onDisconnect);
    socket.on('config', onConfig);
    socket.on('error', onError);
    socket.on('connect_error', onConnectError);
    socket.on('reject', onReject);
    
    if (config('importListen'))
        socket.on('change', onChange);
};

function toLine(obj) {
    const result = {
        value: '',
    };
    
    forEachKey(append(result), obj);
    
    const start = 0;
    const end = 1;
    const backward = -1;
    
    return result.value.slice(start, backward * end);
}
