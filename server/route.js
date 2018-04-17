'use strict';

const DIR = __dirname + '/../';
const DIR_SERVER = './';
const DIR_COMMON = '../common/';

const fs = require('fs');
const path = require('path');

const flop = require('flop');
const ponse = require('ponse');
const rendy = require('rendy');
const format = require('format-io');
const squad = require('squad/legacy');
const apart = require('apart');

const config = require(DIR_SERVER + 'config');
const root = require(DIR_SERVER + 'root');
const prefixer = require(DIR_SERVER + 'prefixer');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const prefix = squad(prefixer, apart(config, 'prefix'));
const isDev = process.env.NODE_ENV === 'development';
const getDist = (isDev) => isDev ? 'dist-dev' : 'dist';

module.exports._getIndexPath = getIndexPath;
function getIndexPath(isDev) {
    const dist = getDist(isDev);
    return path.join(DIR, `${dist}/index.html`);
}

const FS = CloudFunc.FS;

const Columns = require('./columns');
const Template = require('./template');

module.exports = route;
module.exports._getIndexPath = getIndexPath;

/**
 * additional processing of index file
 */
function indexProcessing(options) {
    const isOnePanel = config('onePanelMode');
    const noContact = !config('contact');
    const noConfig = !config('configDialog');
    const noConsole = !config('console');
    const noTerminal = !config('terminal');
    const panel = options.panel;
    
    let data = options.data;
    
    if (!config('keysPanel'))
        data = hideKeysPanel(data);
    
    if (isOnePanel)
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
        className   : !isOnePanel ? '' : 'panel-single'
    });
    
    let right = '';
    if (!isOnePanel)
        right = rendy(Template.panel, {
            side        : 'right',
            content     : panel,
            className   : ''
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

const sendIndex = (params) => (error, data) => {
    const ponseParams = Object.assign({}, params, {
        name: getIndexPath(isDev)
    });
    
    if (error)
        return ponse.sendError(error, ponseParams);
    
    ponse.send(data, ponseParams);
};

/**
 * routing of server queries
 */
function route(request, response, callback) {
    check(request, response, callback);
    
    let name = ponse.getPathName(request);
    
    const isFS = RegExp('^/$|^' + FS).test(name);
    const gzip = true;
    const p = {
        request,
        response,
        gzip,
        name,
    };
    
    if (!isFS)
        return callback();
    
    name = name.replace(CloudFunc.FS, '') || '/';
    const fullPath = root(name);
    
    flop.read(fullPath, (error, dir) => {
        if (dir)
            dir.path = format.addSlashToEnd(name);
        
        if (!error)
            return buildIndex(dir, sendIndex(p));
        
        if (error.code !== 'ENOTDIR')
            return ponse.sendError(error, p);
        
        fs.realpath(fullPath, (error, pathReal) => {
            if (!error)
                p.name = pathReal;
            else
                p.name = name;
            
            p.gzip = false;
            ponse.sendFile(p);
        });
    });
}

function buildIndex(json, callback) {
    fs.readFile(getIndexPath(isDev), 'utf8', (error, template) => {
        if (error)
            return callback(error);
        
        const panel = CloudFunc.buildFromJSON({
            data: json,
            prefix: prefix(),
            template: Template,
        });
        
        const data = indexProcessing({
            panel,
            data: template,
        });
        
        callback(null, data);
    });
}

module.exports._hideKeysPanel = hideKeysPanel;
function hideKeysPanel(html) {
    const keysPanel = '<div id="js-keyspanel" class="{{ className }}"';
    const keysPanelRegExp = '<div id="?js-keyspanel"? class="?{{ className }}"?';
    
    const from = rendy(keysPanelRegExp, {
        className: 'keyspanel'
    });
    
    const to = rendy(keysPanel, {
        className: 'keyspanel hidden'
    });
    
    return html.replace(RegExp(from), to);
}

function check(req, res, next) {
    if (!req)
        throw Error('req could not be empty!');
    
    if (!res)
        throw Error('res could not be empty!');
    
    if (typeof next !== 'function')
        throw Error('next should be function!');
}

