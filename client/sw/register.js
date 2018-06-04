'use strict';

const runtime = require('serviceworker-webpack-plugin/lib/runtime');

module.exports.registerSW = registerSW;
module.exports.unregisterSW = unregisterSW;

async function registerSW() {
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    return runtime.register();
}

async function unregisterSW() {
    const reg = await registerSW();
    return reg.unregister();
}

