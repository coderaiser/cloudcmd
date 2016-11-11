'use strict';

var DIR         = __dirname + '/../../',
    DIR_TMPL    = DIR       + 'tmpl/',
    DIR_HTML    = DIR       + 'html/',
    DIR_LIB     = DIR       + 'lib/',
    DIR_JSON    = DIR       + 'json/',
    DIR_SERVER  = __dirname + '/',
    DIR_FS      = DIR_TMPL  + 'fs/',
    
    fs          = require('fs'),
    
    flop        = require('flop'),
    ponse       = require('ponse'),
    files       = require('files-io'),
    rendy       = require('rendy'),
    exec        = require('execon'),
    
    minify      = require('minify'),
    format      = require('format-io'),
    squad       = require('squad'),
    apart       = require('apart'),
    
    config      = require(DIR_SERVER + 'config'),
    root        = require(DIR_SERVER + 'root'),
    prefixer    = require(DIR_SERVER + 'prefixer'),
    prefix      = squad(prefixer, apart(config, 'prefix')),
    
    CloudFunc   = require(DIR_LIB + 'cloudfunc'),
    
    PATH_INDEX  = DIR_HTML   + 'index.html',
    
    TMPL_PATH   = [
        'file',
        'panel',
        'path',
        'pathLink',
        'link'
    ],
    
    Template    = {},
    
    FS          = CloudFunc.FS,
    
    CSS_URL     = require(DIR_JSON + 'css.json')
        .map(function(name) {
            return 'css/' + name + '.css';
        }).join(':');

module.exports = function(req, res, next) {
    check(req, res, next);
    
    readFiles(function() {
        route(req, res, next);
    });
};

/**
 * additional processing of index file
 */
function indexProcessing(options) {
    var from, to,
        left        = '',
        right       = '',
        keysPanel   = '<div id="js-keyspanel" class="{{ className }}',
        isOnePanel  = config('onePanelMode'),
        noConfig    = !config('configDialog'),
        noConsole   = !config('console'),
        data        = options.data,
        panel       = options.panel;
    
    if (!config('showKeysPanel')) {
        from        = rendy(keysPanel, {
            className: 'keyspanel'
        });
        
        to          = rendy(keysPanel, {
            className: 'keyspanel hidden'
        });
        
        data        = data.replace(from, to);
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
    var filesList,
        paths       = {},
        
        lengthTmpl  = Object.keys(Template).length,
        lenthPath   = TMPL_PATH.length,
        isRead      = lengthTmpl === lenthPath;
    
    if (typeof callback !== 'function')
        throw Error('callback should be function!');
    
    if (isRead) {
        callback();
    } else {
        filesList   = TMPL_PATH.map(function(name) {
            var path = DIR_FS + name + '.hbs';
            
            paths[path] = name;
            
            return path;
        });
        
        files.read(filesList, 'utf8', function(error, files) {
            if (error)
                throw error;
            else
                Object.keys(files).forEach(function(path) {
                    var name = paths[path];
                    
                    Template[name] = files[path];
                });
            
            callback();
        });
    }
}

/**
 * routing of server queries
 */
function route(request, response, callback) {
    var name, p, isAuth, isFS, fullPath;
    
    name    = ponse.getPathName(request);
    
    isAuth  = RegExp('^(/auth|/auth/github)$').test(name);
    isFS    = RegExp('^/$|^' + FS).test(name);
    
    p       = {
        request     : request,
        response    : response,
        gzip        : true,
        name        : name
    };
    
    if (!isAuth && !isFS)
        callback();
    else if (isAuth) {
        p.name = DIR_HTML + name + '.html';
        ponse.sendFile(p);
    } else if (isFS) {
        name        = name.replace(CloudFunc.FS, '') || '/';
        fullPath    = root(name);
        
        flop.read(fullPath, function(error, dir) {
            if (dir)
                dir.path = format.addSlashToEnd(name);
            
            if (!error)
                buildIndex(dir, function(error, data) {
                    p.name = PATH_INDEX;
                    
                    if (error)
                        ponse.sendError(error, p);
                    else
                        ponse.send(data, p);
                });
            else if (error.code !== 'ENOTDIR')
                ponse.sendError(error, p);
            else
                fs.realpath(fullPath, function(error, pathReal) {
                    if (!error)
                        p.name = pathReal;
                    else
                        p.name = name;
                    
                    p.gzip = false;
                    ponse.sendFile(p);
                });
        });
    }
}

function buildIndex(json, callback) {
    var isMinify = config('minify');
    
    exec.if(!isMinify, function(error, name) {
        fs.readFile(name || PATH_INDEX, 'utf8', function(error, template) {
            var panel, data;
            
            if (!error) {
                panel   = CloudFunc.buildFromJSON({
                    data        : json,
                    prefix      : prefix(),
                    template    : Template
                }),
                
                data    = indexProcessing({
                    panel   : panel,
                    data    : template
                });
            }
            
            callback(error, data);
        });
    },  function(callback) {
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
