(function() {
    'use strict';
    
    var DIR         = __dirname     + '/',
        DIR_SERVER  = DIR + 'lib/server/',
        
        main        = require(DIR_SERVER + 'main'),
        format      = require(DIR_SERVER + 'format'),
        mellow      = require(DIR_SERVER + 'mellow'),
        
        HTMLDIR     = main.HTMLDIR,
        JSONDIR     = main.JSONDIR,
        
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
        
        CONFIG_PATH = JSONDIR + 'config.json',
        
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
        
        IsTest,
        
        Template    = {},
        
        FS          = CloudFunc.FS;
        /* reinit main dir os if we on Win32 should be backslashes */
        DIR         = main.DIR;
        
    exports.start = function(params) {
        IsTest = params.isTest;
        
        readConfig(init);
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
    
    
    function init() {
        var params;
        
        if (update)
            update.get();
        
        Util.log('server dir: ' + DIR);
        
        if (IsTest)
            Config.server  = false;
        
        if (Config.logs) {
            Util.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            
            writeLogsToFile();
        }
        
        params      = {
            appcache    : appCacheProcessing,
            rest        : main.rest,
            route       : route
        };
        
        readFiles(params, function(params) {
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
    
    function readConfig(callback) {
        fs.readFile(CONFIG_PATH, 'utf8', function(error, data) {
            var status, json, msg;
            
            if (error) 
                status      = 'error';
            else {
                status      = 'ok';
                json        = Util.parseJSON(data);
                main.config = Config = json;
            }
            
            msg             = CloudFunc.formatMsg('read', 'config', status);
            
            Util.log(msg);
            Util.exec(callback);
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
                
                mellow.read(path, function(error, data) {
                    if (data)
                        data.path = format.addSlashToEnd(name);
                    
                    if (error)
                        if (error.code === 'ENOTDIR') {
                            p.name = path;
                            main.sendFile(p);
                        } else {
                            main.sendError(p, error);
                        }
                    else
                        readIndex(data, function(error, data) {
                            var NOT_LOG = true;
                            
                            p.name = PATH_INDEX;
                            
                            if (error)
                                main.sendError(error);
                            else
                                main.sendResponse(p, data, NOT_LOG);
                        });
                });
            }
        }
    }
    
    function readIndex(json, callback) {
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
                    callback    : callback,
                    returnName  : true
                });
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
