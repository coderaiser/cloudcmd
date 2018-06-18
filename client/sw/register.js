'use strict';

module.exports.registerSW = registerSW;
module.exports.unregisterSW = unregisterSW;

async function registerSW(prefix) {
    prefix = prefix ? `/${prefix}/` : `/`;
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    return navigator.serviceWorker.register(`${prefix}sw.js`);
}

async function unregisterSW() {
    const reg = await registerSW();
    return reg.unregister();
}

