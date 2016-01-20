(function() {
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
        
        config      = require(DIR_SERVER + 'config'),
        root        = require(DIR_SERVER + 'root'),
        
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
        
        Prefix,
        
        FS          = CloudFunc.FS,
        
        CSS_URL   = require(DIR_JSON + 'css.json')
            .map(function(name) {
                return 'css/' + name + '.css';
            }).join(':');
        
    
    module.exports  = function(params) {
        var p = params || {};
        
        Prefix = p.prefix || '';
        
        return middle;
    };
    
    function middle(req, res, next) {
        readFiles(function() {
            route(req, res, next);
        });
    }
    
    /**
     * additional processing of index file
     */
    function indexProcessing(options) {
        var left, right, from, to,
            keysPanel   = '<div id="js-keyspanel" class="{{ className }}',
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
        
        left = rendy(Template.panel, {
            side    : 'left',
            content : panel
        });
        
        right = rendy(Template.panel, {
            side    : 'right',
            content : panel
        });
        
        data = rendy(data, {
            title   : CloudFunc.getTitle(),
            fm      : left + right,
            prefix  : Prefix,
            css     : CSS_URL
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
        
        if (!request)
            throw Error('request could not be empty!');
        
        if (!response)
            throw Error('response could not be empty!');
        
        if (typeof callback !== 'function')
            throw Error('callback should be function!');
        
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
                        prefix      : config('prefix'),
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
})();
