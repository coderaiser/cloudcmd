'use strict';

const process = require('node:process');
require('./css');

const wraptile = require('wraptile');
const load = require('load.js');

const {registerSW, listenSW} = require('./sw/register');

const isDev = process.env.NODE_ENV === 'development';

module.exports = async (config) => {
    window.Util = require('../common/util');
    window.CloudFunc = require('../common/cloudfunc');
    
    window.DOM = require('./dom');
    window.CloudCmd = require('./client');
    
    await register(config);
    
    require('./listeners');
    require('./key');
    require('./sort');
    
    const prefix = getPrefix(config.prefix);
    
    window.CloudCmd.init(prefix, config);
};
window.CloudCmd = module.exports;

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
