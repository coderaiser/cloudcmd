import {createRequire} from 'node:module';
import {extname} from 'node:path';
import _win32 from 'win32';
import ponse from 'ponse';
import rendy from 'rendy';
import format from 'format-io';
import currify from 'currify';
import wraptile from 'wraptile';
import {tryToCatch} from 'try-to-catch';
import once from 'once';
import pipe from 'pipe-io';
import {contentType} from 'mime-types';
import root from './root.js';
import prefixer from './prefixer.js';
import * as CloudFunc from '../common/cloudfunc.mjs';
import Template from './template.js';
import {getColumns} from './columns.mjs';
import {getThemes} from './theme.mjs';

const require = createRequire(import.meta.url);
const {stringify} = JSON;
const {FS} = CloudFunc;

const sendIndex = (params, data) => {
    const ponseParams = {
        ...params,
        name: 'index.html',
    };
    
    ponse.send(data, ponseParams);
};

const onceRequire = once(require);
const getPrefix = (config) => prefixer(config('prefix'));

const getReadDir = (config, {win32 = _win32} = {}) => {
    if (!config('dropbox'))
        return win32.read;
    
    const {readDir} = onceRequire('@cloudcmd/dropbox');
    
    return wraptile(readDir, config('dropboxToken'));
};

/**
 * routing of server queries
 */
export default currify((config, options, request, response, next) => {
    const name = ponse.getPathName(request);
    const isFS = RegExp(`^/$|^${FS}`).test(name);
    
    if (!isFS)
        return next();
    
    route({
        config,
        options,
        request,
        response,
    }).catch(next);
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
    
    if (fullPath.indexOf(config('root')))
        return ponse.sendError(Error(`Path '${fullPath}' beyond root '${config('root')}'`), p);
    
    const {html, win32} = options;
    
    const read = getReadDir(config, {
        win32,
    });
    
    const [error, stream] = await tryToCatch(read, fullPath, {
        root: config('root'),
    });
    
    if (error)
        return ponse.sendError(error, p);
    
    if (stream.type === 'directory') {
        const {files} = stream;
        
        return sendIndex(p, buildIndex(config, html, {
            files,
            path: format.addSlashToEnd(rootName),
        }));
    }
    
    const {contentLength} = stream;
    
    response.setHeader('Content-Length', contentLength);
    response.setHeader('Content-Type', contentType(extname(fullPath)));
    
    await pipe([stream, response]);
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
        data = data.replace('icon-contact', 'icon-contact none');
    
    if (noConfig)
        data = data.replace('icon-config', 'icon-config none');
    
    if (noConsole)
        data = data.replace('icon-console', 'icon-console none');
    
    if (noTerminal)
        data = data.replace('icon-terminal', 'icon-terminal none');
    
    const left = rendy(Template.panel, {
        side: 'left',
        content: panel,
        className: !oneFilePanel ? '' : 'panel-single',
    });
    
    let right = '';
    
    if (!oneFilePanel)
        right = rendy(Template.panel, {
            side: 'right',
            content: panel,
            className: '',
        });
    
    const name = config('name');
    
    data = rendy(data, {
        title: CloudFunc.getTitle({
            name,
        }),
        fm: left + right,
        prefix: getPrefix(config),
        config: stringify(config('*')),
        columns: getColumns()[config('columns')],
        themes: getThemes()[config('theme')],
    });
    
    return data;
}

function buildIndex(config, html, data) {
    const panel = CloudFunc.buildFromJSON({
        data,
        prefix: getPrefix(config),
        template: Template,
        showDotFiles: config('showDotFiles'),
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
