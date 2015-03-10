(function() {
    'use strict';
    
    var DIR         = __dirname + '/../../',
        DIR_HTML    = DIR       + 'html/',
        DIR_LIB     = DIR       + 'lib/',
        DIR_SERVER  = __dirname + '/',
        DIR_FS      = DIR_HTML  + 'fs/',
        
        fs          = require('fs'),
        
        mellow      = require('mellow'),
        ponse       = require('ponse'),
        files       = require('files-io'),
        rendy       = require('rendy'),
        exec        = require('execon'),
        
        minify      = require('minify'),
        format      = require('format-io'),
        
        config      = require(DIR_SERVER + 'config'),
        
        Util        = require(DIR_LIB + 'util'),
        CloudFunc   = require(DIR_LIB + 'cloudfunc'),
        
        PATH_INDEX  = DIR_FS   + 'index.html',
        
        TMPL_PATH   = [
            'file',
            'panel',
            'path',
            'pathLink',
            'link'
        ],
        
        Template    = {},
        
        FS          = CloudFunc.FS;
    
    module.exports  = function(req, res, next) {
        readFiles(function() {
            route(req, res, next);
        });
    };
    
    /**
     * additional processing of index file
     */
    function indexProcessing(options) {
        var left, right, from, to,
            keysPanel   = '<div id="js-keyspanel" class="{{ className }}',
            LEFT        = CloudFunc.PANEL_LEFT,
            RIGHT       = CloudFunc.PANEL_RIGHT,
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
            id      : LEFT,
            side    : 'left',
            content : panel
        });
        
        right = rendy(Template.panel, {
            id      : RIGHT,
            side    : 'right',
            content : panel
        });
        
        data = rendy(data, {
            title   : CloudFunc.getTitle(),
            fm      : left + right
        });
        
        return data;
    }
    
    function readFiles(callback) {
        var filesList,
            paths       = {},
            
            lengthTmpl  = Object.keys(Template).length,
            lenthPath   = TMPL_PATH.length,
            isRead      = lengthTmpl === lenthPath;
        
        Util.check(arguments, ['callback']);
        
        if (isRead) {
            callback();
        } else {
            filesList   = TMPL_PATH.map(function(name) {
                var path = DIR_FS + name + '.html';
                
                paths[path] = name;
                
                return path;
            });
            
            files.read(filesList, 'utf8', function(error, files) {
                if (error)
                    throw(error);
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
        var name, p, isAuth, isFS, path;
        
        Util.check(arguments, ['req', 'res', 'callback']);
        
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
            console.log('* Routing' + '-> ' + name);
            
            p.name = DIR_HTML + name + '.html';
            ponse.sendFile(p);
        } else if (isFS) {
            name    = name.replace(CloudFunc.FS, '') || '/';
            path    = mellow.pathToWin(name);
            
            mellow.read(path, function(error, dir) {
                if (dir)
                    dir.path = format.addSlashToEnd(name);
                
                if (error)
                    if (error.code !== 'ENOTDIR')
                        ponse.sendError(error, p);
                    else
                        fs.realpath(path, function(error, pathReal) {
                            if (!error)
                                p.name = pathReal;
                            else
                                p.name = path;
                            
                            p.gzip = false;
                            ponse.sendFile(p);
                        });
                else
                    buildIndex(dir, function(error, data) {
                        var NOT_LOG = true;
                        
                        p.name = PATH_INDEX;
                        
                        if (error)
                            ponse.sendError(error, p);
                        else
                            ponse.send(data, p, NOT_LOG);
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
                        template    : Template
                    }),
                    
                    data    = indexProcessing({
                        panel   : panel,
                        data    : template
                    });
                }
                
                exec(callback, error, data);
            });
        },  function(callback) {
                minify(PATH_INDEX, 'name', callback);
        });
    }
})();
