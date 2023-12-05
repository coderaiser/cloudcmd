'use strict';

const tryToCatch = require('try-to-catch');
const {Workbox} = require('workbox-window');

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
    
    const {serviceWorker} = navigator;
    //const register = serviceWorker.register.bind(serviceWorker);
    //const [e, sw] = await tryToCatch(register, `${prefix}/sw.js`);
     const wb = new Workbox(`${prefix}/sw.js`);
     const register = wb.register.bind(wb);
    const [e, sw] = await tryToCatch(register);
    
    if (e)
        return null;
    
    return sw;
}

async function unregisterSW(prefix) {
    const reg = await registerSW(prefix);
    reg?.unregister(prefix);
}
