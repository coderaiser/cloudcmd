'use strict';

const process = require('node:process');
require('../css/main.css');

const wraptile = require('wraptile');
const load = require('load.js');

const {registerSW, listenSW} = require('./sw/register');
const {initSortPanel, sortPanel} = require('./sort.mjs');

const isDev = process.env.NODE_ENV === 'development';

module.exports = async (config) => {
    globalThis.Util = require('../common/util');
    globalThis.CloudFunc = require('../common/cloudfunc');
    
    globalThis.DOM = require('./dom');
    globalThis.CloudCmd = require('./client');
    
    await register(config);
    
    require('./listeners');
    require('./key');
    
    initSortPanel();
    globalThis.CloudCmd.sortPanel = sortPanel;
    const prefix = getPrefix(config.prefix);
    
    globalThis.CloudCmd.init(prefix, config);
    
    if (globalThis.CloudCmd.config('menu') === 'aleman')
        setTimeout(() => {
            import('https://esm.sh/@putout/processor-html');
            import('https://esm.sh/@putout/bundle');
        }, 100);
};
globalThis.CloudCmd = module.exports;

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
    
    const {DOM} = globalThis;
    const prefix = getPrefix(config.prefix);
    
    await load.js(`${prefix}/dist/cloudcmd.common.js`);
    await load.js(`${prefix}/dist/cloudcmd.js`);
    
    console.log('cloudcmd: sw: updated');
    
    DOM.Events.removeAll();
    globalThis.CloudCmd(config);
});

async function register(config) {
    const {prefix} = config;
    const sw = await registerSW(prefix);
    
    listenSW(sw, 'updatefound', onUpdateFound(config));
}
