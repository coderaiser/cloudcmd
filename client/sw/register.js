'use strict';

const runtime = require('serviceworker-webpack-plugin/lib/runtime');

module.exports = () => {
    if (!navigator.serviceWorker)
        return;
    
    const isHTTPS = location.protocol === 'https:';
    const isLocalhost = location.hostname === 'localhost';
    
    if (!isHTTPS && !isLocalhost)
        return;
    
    runtime.register();
};

