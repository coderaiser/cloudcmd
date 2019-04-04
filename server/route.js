'use strict';

const DIR_SERVER = './';
const DIR_COMMON = '../common/';

const fs = require('fs');
const {promisify} = require('util');

const flop = require('flop');
const ponse = require('ponse');
const rendy = require('rendy');
const format = require('format-io');
const squad = require('squad');
const apart = require('apart');
const currify = require('currify');
const tryToCatch = require('try-to-catch');

const config = require(DIR_SERVER + 'config');
const root = require(DIR_SERVER + 'root');
const prefixer = require(DIR_SERVER + 'prefixer');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const prefix = squad(prefixer, apart(config, 'prefix'));

const sendIndex = (params, data) => {
    const ponseParams = {
        ...params,
        name: 'index.html',
    };
    
    ponse.send(data, ponseParams);
};

const {FS} = CloudFunc;

const Columns = require(`${DIR_SERVER}/columns`);
const Template = require(`${DIR_SERVER}/template`);

const getReadDir = () => {
    if (!config('dropbox'))
        return promisify(flop.read);
    
    const tokenize = (fn, a) => (b) => fn(a, b);
    const {readDir} = require('@cloudcmd/dropbox');
    
    return tokenize(readDir, config('dropboxToken'));
};

const read = getReadDir();
const realpath = promisify(fs.realpath);

/**
 * routing of server queries
 */
module.exports = currify((options, request, response, next) => {
    const name = ponse.getPathName(request);
    const isFS = RegExp('^/$|^' + FS).test(name);
    
    if (!isFS)
        return next();
    
    route(options, request, response)
        .catch(next);
});

module.exports._getReadDir = getReadDir;

async function route(options, request, response) {
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
    const fullPath = root(rootName);
    
    const [error, dir] = await tryToCatch(read, fullPath);
    const {html} = options;
    
    if (!error)
        return sendIndex(p, buildIndex(html, {
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
function indexProcessing(options) {
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
        prefix: prefix(),
        config: JSON.stringify(config('*')),
        columns: Columns[config('columns')],
    });
    
    return data;
}

function buildIndex(html, json) {
    const panel = CloudFunc.buildFromJSON({
        data: json,
        prefix: prefix(),
        template: Template,
    });
    
    return indexProcessing({
        panel,
        data: html,
    });
}

module.exports._hideKeysPanel = hideKeysPanel;
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

