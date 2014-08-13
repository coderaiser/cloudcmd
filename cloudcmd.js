(function() {
    'use strict';
    
    var DIR         = __dirname     + '/',
        DIR_SERVER  = DIR + 'lib/server/',
        
        main        = require(DIR_SERVER + 'main'),
        format      = require(DIR_SERVER + 'format'),
        mellow      = require(DIR_SERVER + 'mellow'),
        
        HTMLDIR     = main.HTMLDIR,
        
        fs          = main.fs,
        files       = main.files,
        CloudFunc   = main.cloudfunc,
        AppCache    = main.appcache,
        Util        = main.util,
        update      = main.update,
        
        server      = main.librequire('server'),
        
        Minify      = main.minify,
        Config      = main.config,
        
        win         = require(DIR_SERVER + 'win'),
        
        KEY         = DIR + 'ssl/ssl.key',
        CERT        = DIR + 'ssl/ssl.crt',
        
        HTML_FS_DIR = HTMLDIR       + 'fs/',
        
        PATH_INDEX  = HTML_FS_DIR   + 'index.html',
        
        TMPL_PATH   = [
            'file',
            'panel',
            'path',
            'pathLink',
            'link',
        ],
        
        Template    = {},
        
        FS          = CloudFunc.FS;
        /* reinit main dir os if we on Win32 should be backslashes */
        DIR         = main.DIR;
        
    exports.start = function(params) {
        readConfig(function(msg, config) {
            var keys;
            
            Util.log(msg);
            
            if (!config)
                config = {};
            
            if (params) {
                keys = Object.keys(params);
                
                keys.forEach(function(item) {
                    config[item] = params[item];
                });
            }
            
            init(config);
            
        });
        
        win.prepareCodePage();
    };
    
    /**
     * additional processing of index file
     */
    function indexProcessing(options) {
        var keysPanel, left, right,
            LEFT    = CloudFunc.PANEL_LEFT,
            RIGHT   = CloudFunc.PANEL_RIGHT,
            data    = options.data,
            panel   = options.panel;
        
        if (!Config.appCache)
            data = Util.rmStr(data, [
                /* min */
                ' manifest=/cloudcmd.appcache',
                /* normal */
                ' manifest="/cloudcmd.appcache"'
            ]);
        
        if (!Config.showKeysPanel) {
            keysPanel  = '<div class="keyspanel';
            data        = data.replace(keysPanel + '"', keysPanel +' hidden"');
        }
        
        left    = Util.render(Template.panel, {
            id      : LEFT,
            side    : 'left',
            content : panel
        });
        
        right    = Util.render(Template.panel, {
            id      : RIGHT,
            side    : 'right',
            content : panel
        });
        
        data = Util.render(data, {
            title   : CloudFunc.getTitle(),
            fm      : left + right
        });
        
        return data;
    }
    
    /**
     * init and process of appcache if it allowed in config
     */
    function appCacheProcessing() {
        var FONT_REMOTE         = '//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff',
            FONT_LOCAL          = './font/DroidSansMono.woff',
            JQUERY_REMOTE       = '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
            JQUERY_LOCAL        = './lib/client/jquery.js',
            files               = [{}, {}];
            
        files[0][FONT_REMOTE]   = FONT_LOCAL;
        files[1][JQUERY_REMOTE] = JQUERY_LOCAL;
        
        AppCache.addFiles(files);
        AppCache.createManifest();
    }
    
    
    function init(config) {
        var paramsStart;
        
        Util.log('server dir: ' + DIR);
        
        if (update)
            update.get();
        
        if (config) {
            main.config = Config = config;
            
            if (config.test)
                Config.server  = false;
        }
        
        if (Config.logs) {
            Util.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            
            writeLogsToFile();
        }
        
        paramsStart = {
            appcache    : appCacheProcessing,
            rest        : main.rest,
            route       : route
        };
        
        readFiles(paramsStart, function(params) {
            server.start(params);
        });
    }
    
    function readFiles(params, callback) {
        var filesList, paths   = {};
        
        filesList   = TMPL_PATH.map(function(name) {
            var path = HTML_FS_DIR + name + '.html';
            
            paths[path] = name;
            
            return path;
        });
        
        if (Config.ssl)
            filesList.push(KEY, CERT);
        
        files.read(filesList, 'utf8', function(error, files) {
            var status, msg, names;
            
            if (error) {
                Util.log(error);
            } else {
                status          = 'ok';
                
                Object.keys(files).forEach(function(path) {
                    var name = paths[path];
                    
                    Template[name] = files[path];
                });
                
                if (Config.ssl)
                    params.ssl  = {
                        key     : files[KEY],
                        cert    : files[CERT]
                    };
                
                names           = TMPL_PATH.map(function(item) {
                    return item + '.html';
                });
                
                msg = CloudFunc.formatMsg('read', names, status);
                Util.log(msg);
            }
            
            callback(params);
        });
    }
    
    /**
     * routing of server queries
     */
    function route(request, response, callback) {
        var name, p, isAuth, isFS, path;
        
        if (request && response) {
            name    = main.getPathName(request);
            isAuth  = Util.strCmp(name, ['/auth', '/auth/github']);
            isFS    = Util.strCmp(name, '/') || Util.isContainStrAtBegin(name, FS);
            
            p       = {
                request     : request,
                response    : response,
                name        : name
            };
            
            if (!isAuth && !isFS)
                Util.exec(callback);
            else if (isAuth) {
                Util.log('* Routing' + '-> ' + name);
                
                p.name = main.HTMLDIR + name + '.html';
                main.sendFile(p);
            } else if (isFS) {
                name    = Util.rmStrOnce(name, CloudFunc.FS) || main.SLASH;
                path    = mellow.convertPath(name);
                
                mellow.read(path, function(error, dir) {
                    if (dir)
                        dir.path = format.addSlashToEnd(name);
                    
                    if (error)
                        if (error.code === 'ENOTDIR') {
                            p.name = path;
                            main.sendFile(p);
                        } else {
                            main.sendError(error, p);
                        }
                    else
                        buildIndex(dir, function(error, data) {
                            var NOT_LOG = true;
                            
                            p.name = PATH_INDEX;
                            
                            if (error)
                                main.sendError(error, p);
                            else
                                main.sendResponse(data, p, NOT_LOG);
                        });
                });
            }
        }
    }
    
    function buildIndex(json, callback) {
        var isMinify = Minify && Config.minify;
        
        Util.exec.if(!isMinify, function(error, params) {
            var name = params && params.name;
            
            fs.readFile(name || PATH_INDEX, 'utf8', function(error, template) {
                var panel, data;
                
                if (!error) {
                    panel   = CloudFunc.buildFromJSON({
                        data        : json,
                        template    : Template
                    }),
                    
                    data    = indexProcessing({
                        panel   : panel,
                        data    : template,
                    });
                }
                
                Util.exec(callback, error, data);
            });
        },  function(callback) {
                Minify.optimize(PATH_INDEX, {
                    returnName  : true
                }, callback);
        });
    }
    
    function readConfig(callback) {
        var path = DIR + 'json/config.json';
        
        Util.checkArgs(arguments, ['callback']);
        
        fs.readFile(path, 'utf8', function(error, data) {
            var status, config, msg;
            
            if (error) {
                status  = 'error';
            } else {
                status  = 'ok';
                config  = Util.parseJSON(data);
            }
            
            msg         = CloudFunc.formatMsg('read', 'config', status);
            
            callback(msg, config);
        });
    }
    
    /* function sets stdout to file log.txt */
    function writeLogsToFile() {
        var stdout      = process.stdout,
            writeFile   = fs.createWriteStream('log.txt'),
            write       = writeFile.write.bind(writeFile);
        
        stdout.write    = write;
    }
})();
