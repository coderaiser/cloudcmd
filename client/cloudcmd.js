'use strict';

require('../css/main.css');
require('../css/nojs.css');
require('../css/columns/name-size-date.css');
require('../css/columns/name-size.css');

const {promisify} = require('es6-promisify');
const wraptile = require('wraptile/legacy');
const load = require('load.js');

const isDev = process.env.NODE_ENV === 'development';

const {
    registerSW,
    listenSW,
} = require('./sw/register');

// prevent additional loading of emitify
window.Emitify = require('emitify/legacy');

module.exports = window.CloudCmd = (config) => {
    window.Util = require('../common/util');
    window.CloudFunc = require('../common/cloudfunc');
    
    const DOM = require('./dom');
    
    window.DOM = DOM;
    window.CloudCmd = require('./client');
    
    register(config);
    
    require('./listeners');
    require('./key');
    require('./sort');
    
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
    const js = promisify(load.js);
    
    await js(`${prefix}/dist/cloudcmd.common.js`);
    await js(`${prefix}/dist/cloudcmd.js`);
    
    console.log('cloudcmd: sw: updated');
    
    DOM.Events.removeAll();
    window.CloudCmd(config);
});

async function register(config) {
    const {prefix} = config;
    const sw = await registerSW(prefix);
    
    listenSW(sw, 'updatefound', onUpdateFound(config));
}

