(function() {
    'use strict';
    
    var DIR         = __dirname     + '/',
        main        = require(DIR   + 'lib/server/main'),
        
        LIBDIR      = main.LIBDIR,
        SRVDIR      = main.SRVDIR,
        CLIENTDIR   = LIBDIR + 'client',
        HTMLDIR     = main.HTMLDIR,
        JSONDIR     = main.JSONDIR,
        
        path        = main.path,
        fs          = main.fs,
        files       = main.files,
        CloudFunc   = main.cloudfunc,
        AppCache    = main.appcache,
        Util        = main.util,
        update      = main.update,
        dir         = main.dir,
        
        server      = main.librequire('server'),
        Minify      = main.minify,
        Config      = main.config,
        
        CONFIG_PATH = JSONDIR + 'config.json',
        
        KEY         = DIR   + 'ssl/ssl.key',
        CERT        = DIR + 'ssl/ssl.crt',
        
        HTML_FS_DIR = HTMLDIR       + 'fs/',
        INDEX_PATH  = HTML_FS_DIR   + 'index.html',
        FILE_TMPL   = HTML_FS_DIR   + 'file.html',
        PANEL_TMPL  = HTML_FS_DIR   + 'panel.html',
        PATH_TMPL   = HTML_FS_DIR   + 'path.html',
        LINK_TMPL   = HTML_FS_DIR   + 'link.html',
        
        FileTemplate, PanelTemplate, PathTemplate, LinkTemplate,
        
        FS          = CloudFunc.FS;
        /* reinit main dir os if we on Win32 should be backslashes */
        DIR         = main.DIR;
    
    readConfig(init);
    
    
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
            data = Util.removeStr(data, [
                /* min */
                ' manifest=/cloudcmd.appcache',
                /* normal */
                ' manifest="/cloudcmd.appcache"'
            ]);
        
        if (!Config.showKeysPanel) {
            lKeysPanel  = '<div class="keyspanel';
            data        = data.replace(keysPanel + '"', keysPanel +' hidden"');
        }
        
        left    = Util.render(PanelTemplate, {
            id      : LEFT,
            side    : 'left',
            content : panel
        });
        
        right    = Util.render(PanelTemplate, {
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
        var serverDir, params, filesList, isContain, argvFirst,
            argv = process.argv;
        
        if (update)
            update.get();
        
        /* Determining server.js directory
         * and chang current process directory
         * (usually /) to it.
         * argv[1] - is always script name
         */
        serverDir = path.dirname(argv[1]) + '/';
        
        if (DIR !== serverDir) {
            Util.log('current dir: ' + DIR);
            process.chdir(serverDir);
        }
        
        Util.log('server dir: ' + serverDir);
        
        /* if command line parameter testing resolved 
         * setting config to testing, so server
         * not created, just init and
         * all logs writed to screen */
        argvFirst    = argv[argv.length - 1];
        isContain   = Util.isContainStr(argvFirst, 'test');
        
        if (isContain) {
            Util.log(argv);
            Config.server  = false;
        }
        
        if (Config.logs) {
            Util.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            
            writeLogsToFile();
        }
        
        params = {
            appcache    : appCacheProcessing,
            rest        : main.rest,
            route       : route
        };
        
        filesList = [FILE_TMPL, PANEL_TMPL, PATH_TMPL, LINK_TMPL];
        
        if (Config.ssl)
            filesList.push(KEY, CERT);
        
        files.read(filesList, 'utf-8', function(errors, files) {
            if (errors)
                Util.log(errors);
            else {
                FileTemplate    = files[FILE_TMPL];
                PanelTemplate   = files[PANEL_TMPL];
                PathTemplate    = files[PATH_TMPL];
                LinkTemplate    = files[LINK_TMPL];
                
                if (Config.ssl)
                    params.ssl = {
                        key     : files[KEY],
                        cert    : files[CERT]
                    };
                
                server.start(params);
            }
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
        var name, p, isAuth, isFS, query;
        
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
                name    = Util.removeStrOneTime(name, CloudFunc.FS) || main.SLASH;
                
                getContent(name, function(error, data, isFile) {
                    var json,
                        query   = main.getQuery(request),
                        isJSON  = Util.isContainStr(query, 'json');
                    
                    if (error)
                        main.sendError(p, error);
                    else if (isFile) {
                        p.name = name;
                        main.sendFile(p);
                    } else if (isJSON) {
                        p.name +='.json';
                        json    = Util.stringifyJSON(data);
                        main.sendResponse(p, json, true);
                    } else
                        readIndex(data, function(error, data) {
                            p.name = INDEX_PATH;
                            
                            if (error)
                                main.sendError(error);
                            else
                                main.sendResponse(p, data, true); 
                        });
                });
            }
        }
    }
    
    function getContent(name, callback) {
        dir.isDir(name, function(error, isDir) {
            var getDirContent   = main.commander.getDirContent,
                func            = Util.retExec(callback);
            
            if (!error && isDir)
                getDirContent(name, callback);
            else
                func(error, null, !isDir);
       });
    }
    
    function readIndex(json, callback) {
        Util.ifExec(!Minify, function(params) {
            var name = params && params.name;
            
            fs.readFile(name || INDEX_PATH, 'utf8', function(error, template) {
                var panel, data,
                    config  = main.config,
                    minify  = config.minify;
                
                if (!error) {
                    panel   = CloudFunc.buildFromJSON(json, FileTemplate, PathTemplate, LinkTemplate),
                    data    = indexProcessing({
                        panel   : panel,
                        data    : template,
                    });
                }
                
                Util.exec(callback, error, data);
            });
        },  function(callback) {
                Minify.optimize(INDEX_PATH, {
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