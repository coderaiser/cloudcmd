import {realpath} from 'fs/promises';
import {createRequire} from 'module';

import {read} from 'flop';
import ponse from 'ponse';
import rendy from 'rendy';
import format from 'format-io';
import currify from 'currify';
import tryToCatch from 'try-to-catch';
import once from 'once';

import root from './root.js';
import prefixer from './prefixer.js';
import * as CloudFunc from '../common/cloudfunc.js';

const getPrefix = (config) => prefixer(config('prefix'));

const require = createRequire(import.meta.url);
const onceRequire = once(require);

const sendIndex = (params, data) => {
    const ponseParams = {
        ...params,
        name: 'index.html',
    };
    
    ponse.send(data, ponseParams);
};

const {FS} = CloudFunc;

import Columns from './/columns.js';
import Template from './/template.js';

const tokenize = (fn, a) => (b) => fn(a, b);
const getReadDir = (config) => {
    if (!config('dropbox'))
        return read;
    
    const {readDir} = onceRequire('@cloudcmd/dropbox');
    
    return tokenize(readDir, config('dropboxToken'));
};

/**
 * routing of server queries
 */
export default currify((config, options, request, response, next) => {
    const name = ponse.getPathName(request);
    const isFS = RegExp('^/$|^' + FS).test(name);
    
    if (!isFS)
        return next();
    
    route({config, options, request, response})
        .catch(next);
});

export const _getReadDir = getReadDir;

async function route({config, options, request, response}) {
    const name = ponse.getPathName(request);
    const gzip = true;
    const p = {
        request,
        response,
        gzip,
        name,
    };
    
    config('prefix', prefixer(request.baseUrl));
    
    const rootName = name.replace(CloudFunc.FS, '') || '/';
    const fullPath = root(rootName, config('root'));
    
    const read = getReadDir(config);
    const [error, dir] = await tryToCatch(read, fullPath);
    const {html} = options;
    
    if (!error)
        return sendIndex(p, buildIndex(config, html, {
            ...dir,
            path: format.addSlashToEnd(rootName),
        }));
    
    if (error.code !== 'ENOTDIR')
        return ponse.sendError(error, p);
    
    const [realPathError, pathReal] = await tryToCatch(realpath, fullPath);
    
    ponse.sendFile({
        ...p,
        name: realPathError ? name : pathReal,
        gzip: false,
    });
}

/**
 * additional processing of index file
 */
function indexProcessing(config, options) {
    const oneFilePanel = config('oneFilePanel');
    const noKeysPanel = !config('keysPanel');
    const noContact = !config('contact');
    const noConfig = !config('configDialog');
    const noConsole = !config('console');
    const noTerminal = !config('terminal');
    const {panel} = options;
    
    let {data} = options;
    
    if (noKeysPanel)
        data = hideKeysPanel(data);
    
    if (oneFilePanel)
        data = data
            .replace('icon-move', 'icon-move none')
            .replace('icon-copy', 'icon-copy none');
    
    if (noContact)
        data = data
            .replace('icon-contact', 'icon-contact none');
    
    if (noConfig)
        data = data
            .replace('icon-config', 'icon-config none');
    
    if (noConsole)
        data = data
            .replace('icon-console', 'icon-console none');
    
    if (noTerminal)
        data = data
            .replace('icon-terminal', 'icon-terminal none');
    
    const left = rendy(Template.panel, {
        side        : 'left',
        content     : panel,
        className   : !oneFilePanel ? '' : 'panel-single',
    });
    
    let right = '';
    
    if (!oneFilePanel)
        right = rendy(Template.panel, {
            side        : 'right',
            content     : panel,
            className   : '',
        });
    
    const name = config('name');
    
    data = rendy(data, {
        title: CloudFunc.getTitle({
            name,
        }),
        fm: left + right,
        prefix: getPrefix(config),
        config: JSON.stringify(config('*')),
        columns: Columns[config('columns')],
    });
    
    return data;
}

function buildIndex(config, html, data) {
    const panel = CloudFunc.buildFromJSON({
        data,
        prefix: getPrefix(config),
        template: Template,
    });
    
    return indexProcessing(config, {
        panel,
        data: html,
    });
}

export const _hideKeysPanel = hideKeysPanel;
function hideKeysPanel(html) {
    const keysPanel = '<div id="js-keyspanel" class="{{ className }}"';
    const keysPanelRegExp = '<div id="?js-keyspanel"? class="?{{ className }}"?';
    
    const from = rendy(keysPanelRegExp, {
        className: 'keyspanel',
    });
    
    const to = rendy(keysPanel, {
        className: 'keyspanel hidden',
    });
    
    return html.replace(RegExp(from), to);
}

