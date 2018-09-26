'use strict';

const DIR_SERVER = './';
const DIR_COMMON = '../common/';

const fs = require('fs');

const flop = require('flop');
const ponse = require('ponse');
const rendy = require('rendy');
const format = require('format-io');
const squad = require('squad');
const apart = require('apart');
const currify = require('currify');

const config = require(DIR_SERVER + 'config');
const root = require(DIR_SERVER + 'root');
const prefixer = require(DIR_SERVER + 'prefixer');
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const prefix = squad(prefixer, apart(config, 'prefix'));

const sendIndex = (params, data) => {
    const ponseParams = {
        ...params,
        name: 'index.html'
    };
    
    ponse.send(data, ponseParams);
};

const FS = CloudFunc.FS;

const Columns = require('./columns');
const Template = require('./template');

/**
 * routing of server queries
 */
module.exports = currify((options, request, response, callback) => {
    const html = options.html;
    
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
            return sendIndex(p, buildIndex(html, dir));
        
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
});

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
    const panel = options.panel;
    
    let data = options.data;
    
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
        className   : !oneFilePanel ? '' : 'panel-single'
    });
    
    let right = '';
    if (!oneFilePanel)
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
        className: 'keyspanel'
    });
    
    const to = rendy(keysPanel, {
        className: 'keyspanel hidden'
    });
    
    return html.replace(RegExp(from), to);
}

