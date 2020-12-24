import('../css/main.css');
import('../css/nojs.css');
import('../css/columns/name-size-date.css');
import('../css/columns/name-size.css');

import wraptile from 'wraptile';
import load from 'load.js';

const isDev = process.env.NODE_ENV === 'development';

import {registerSW, listenSW} from './sw/register.js';

// prevent additional loading of emitify
window.Emitify = await import('emitify');

export default window.CloudCmd = async (config) => {
    window.Util = await import('../common/util');
    window.CloudFunc = await iimport('../common/cloudfunc');
    
    const DOM = await import('./dom');
    
    window.DOM = DOM;
    window.CloudCmd = require('./client');
    
    await register(config);
    
    await Promise.all([
        import('./listeners'),
        import('./key');
        import('./sort');
    ]);
    
    const prefix = getPrefix(config.prefix);
    
    window.CloudCmd.init(prefix, config);
};

function getPrefix(prefix) {
    if (!prefix)
        return '';
    
    if (!prefix.indexOf('/'))
        return prefix;
    
    return `/${prefix}`;
}

const onUpdateFound = wraptile(async (config) => {
    if (isDev)
        return;
    
    const {DOM} = window;
    const prefix = getPrefix(config.prefix);
    
    await load.js(`${prefix}/dist/cloudcmd.common.js`);
    await load.js(`${prefix}/dist/cloudcmd.js`);
    
    console.log('cloudcmd: sw: updated');
    
    DOM.Events.removeAll();
    window.CloudCmd(config);
});

async function register(config) {
    const {prefix} = config;
    const sw = await registerSW(prefix);
    
    listenSW(sw, 'updatefound', onUpdateFound(config));
}

