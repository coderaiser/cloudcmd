import process from 'node:process';
import wraptile from 'wraptile';
import load from 'load.js';
import '../css/main.css';
import {registerSW, listenSW} from './sw/register.mjs';
import {initSortPanel, sortPanel} from './sort.mjs';
import Util from '../common/util.js';
import * as CloudFunc from '../common/cloudfunc.mjs';
import DOM from './dom/index.js';
import {createCloudCmd} from './client.mjs';
import * as Listeners from './listeners/index.mjs';

const isDev = process.env.NODE_ENV === 'development';

export default init;

globalThis.CloudCmd = init;

async function init(config) {
    globalThis.CloudCmd = createCloudCmd({
        DOM,
        Listeners,
    });
    globalThis.DOM = DOM;
    globalThis.Util = Util;
    globalThis.CloudFunc = CloudFunc;
    
    await register(config);
    
    initSortPanel();
    globalThis.CloudCmd.sortPanel = sortPanel;
    const prefix = getPrefix(config.prefix);
    
    globalThis.CloudCmd.init(prefix, config);
    
    if (globalThis.CloudCmd.config('menu') === 'aleman')
        setTimeout(() => {
            import('https://esm.sh/@putout/processor-html');
            import('https://esm.sh/@putout/bundle');
        }, 100);
}

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
