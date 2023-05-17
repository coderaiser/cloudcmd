'use strict';

const tryToCatch = require('try-to-catch');

module.exports.registerSW = registerSW;
module.exports.unregisterSW = unregisterSW;

module.exports.listenSW = (sw, ...args) => {
    sw?.addEventListener(...args);
};

async function registerSW(prefix) {
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    const [e, sw] =  await tryToCatch(navigator.serviceWorker.register,`${prefix}/sw.js`);
    
    if (e)
        return null;

    return sw;
}

async function unregisterSW(prefix) {
    const reg = await registerSW(prefix);
    reg?.unregister(prefix);
}

