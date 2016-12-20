'use strict';

const DIR = __dirname + '/../../';
const DIR_TMPL = DIR + 'tmpl/';
const DIR_HTML = DIR + 'html/';
const DIR_COMMON = DIR + 'common/';
const DIR_JSON = DIR + 'json/';
const DIR_SERVER = __dirname + '/';
const DIR_FS = DIR_TMPL + 'fs/';

const fs = require('fs');

const flop = require('flop');
const ponse = require('ponse');
const files = require('files-io');
const rendy = require('rendy');
const exec = require('execon');
const minify = require('minify');
const format = require('format-io');
const squad = require('squad');
const apart = require('apart');

const config = require(DIR_SERVER + 'config');
const root = require(DIR_SERVER + 'root');
const prefixer = require(DIR_SERVER + 'prefixer');
const prefix = squad(prefixer, apart(config, 'prefix'));
const CloudFunc = require(DIR_COMMON + 'cloudfunc');

const PATH_INDEX = DIR_HTML + 'index.html';

const TMPL_PATH   = [
    'file',
    'panel',
    'path',
    'pathLink',
    'link'
];

const Template = {};
const FS = CloudFunc.FS;

const CSS_URL = require(DIR_JSON + 'css.json')
    .map((name) => {
        return 'css/' + name + '.css'
    }).join(':');

module.exports = (req, res, next) => {
    check(req, res, next);
    
    readFiles(() => {
        route(req, res, next);
    });
};

/**
 * additional processing of index file
 */
function indexProcessing(options) {
    let from;
    let to;
    let left = '';
    let right = '';
    const keysPanel = '<div id="js-keyspanel" class="{{ className }}';
    const isOnePanel = config('onePanelMode');
    const noConfig = !config('configDialog');
    const noConsole = !config('console');
    const panel = options.panel;
    
    let data = options.data;
    
    if (!config('showKeysPanel')) {
        from = rendy(keysPanel, {
            className: 'keyspanel'
        });
        
        to = rendy(keysPanel, {
            className: 'keyspanel hidden'
        });
        
        data = data.replace(from, to);
    }
    
    if (isOnePanel)
        data = data
            .replace('icon-move', 'icon-move none')
            .replace('icon-copy', 'icon-copy none');
    
    if (noConfig)
        data = data
             .replace('icon-config', 'icon-config none');
    
    if (noConsole)
        data = data
             .replace('icon-console', 'icon-console none');
    
    left = rendy(Template.panel, {
        side        : 'left',
        content     : panel,
        className   : !isOnePanel ? '' : 'panel-single'
    });
    
    if (!isOnePanel)
        right = rendy(Template.panel, {
            side        : 'right',
            content     : panel,
            className   : ''
        });
    
    data = rendy(data, {
        title: CloudFunc.getTitle(),
        fm: left + right,
        prefix: prefix(),
        css: CSS_URL
    });
    
    return data;
}

function readFiles(callback) {
    const paths = {};
    const lengthTmpl = Object.keys(Template).length;
    const lenthPath = TMPL_PATH.length;
    const isRead = lengthTmpl === lenthPath;
    
    if (typeof callback !== 'function')
        throw Error('callback should be a function!');
    
    if (isRead)
        return callback();
        
    const filesList = TMPL_PATH.map((name) => {
        const path = DIR_FS + name + '.hbs';
        
        paths[path] = name;
        
        return path;
    });
    
    files.read(filesList, 'utf8', (error, files) => {
        if (error)
            throw error;
            
        Object.keys(files).forEach((path) => {
            const name = paths[path];
            
            Template[name] = files[path];
        });
        
        callback();
    });
}

/**
 * routing of server queries
 */
function route(request, response, callback) {
    let name = ponse.getPathName(request);
    
    const isAuth = RegExp('^(/auth|/auth/github)$').test(name);
    const isFS = RegExp('^/$|^' + FS).test(name);
    const p = {
        request     : request,
        response    : response,
        gzip        : true,
        name        : name
    };
    
    if (!isAuth && !isFS)
        return callback();
    
    if (isAuth) {
        p.name = DIR_HTML + name + '.html';
        ponse.sendFile(p);
        return;
    }
    
    if (!isFS)
        return;
    
    name = name.replace(CloudFunc.FS, '') || '/';
    const fullPath = root(name);
    
    flop.read(fullPath, (error, dir) => {
        if (dir)
            dir.path = format.addSlashToEnd(name);
        
        if (!error)
            return buildIndex(dir, (error, data) => {
                p.name = PATH_INDEX;
                
                if (error)
                    return ponse.sendError(error, p);
                    
                ponse.send(data, p);
            });
        
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
    const isMinify = config('minify');
    
    exec.if(!isMinify, (error, name) => {
        fs.readFile(name || PATH_INDEX, 'utf8', (error, template) => {
            if (error)
                return;
                
            const panel = CloudFunc.buildFromJSON({
                data        : json,
                prefix      : prefix(),
                template    : Template
            });
            
            const data = indexProcessing({
                panel   : panel,
                data    : template
            });
            
            callback(error, data);
        });
    },  (callback) => {
        minify(PATH_INDEX, 'name', callback);
    });
}

function check(req, res, next) {
    if (!req)
        throw Error('req could not be empty!');
    
    if (!res)
        throw Error('res could not be empty!');
    
    if (typeof next !== 'function')
        throw Error('next should be function!');
}

