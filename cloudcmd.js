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
        CloudFunc   = main.cloudfunc,
        AppCache    = main.appcache,
        Util        = main.util,
        update      = main.update,
        
        server      = main.librequire('server'),
        Minify      = main.minify,
        Config      = main.config,
        
        INDEX       = HTMLDIR + 'index.html',
        CONFIG_PATH = JSONDIR + 'config.json',
        
        CA          = DIR + 'ssl/sub.class1.server.ca.pem',
        KEY         = DIR + 'ssl/ssl.key',
        CERT        = DIR + 'ssl/ssl.crt',
        
        FILE_TMPL   = HTMLDIR + 'file.html',
        PATH_TMPL   = HTMLDIR + 'path.html',
        INDEX_TMPL  = HTMLDIR + 'index.html',
        
        FileTemplate, PathTemplate, IndexTemplate,
        
        FS          = CloudFunc.FS;
        /* reinit main dir os if we on Win32 should be backslashes */
        DIR         = main.DIR;
    
    readConfig(init);
    
    
    /**
     * additional processing of index file
     */
    function indexProcessing(pData) {
        var lPath, lReplace, lKeysPanel,
            lData       = pData.data,
            lAdditional = pData.additional;
        
        if (!Config.appCache)
            lData = Util.removeStr(lData, [
                /* min */
                ' manifest=/cloudcmd.appcache',
                /* normal */
                ' manifest="/cloudcmd.appcache"'
            ]);
        
        if (!Config.showKeysPanel) {
            lKeysPanel  = '<div class="keyspanel';
            lData       = lData.replace(lKeysPanel + '"', lKeysPanel +' hidden"');
        }
        
        lData = Util.render(lData, {
            title   : CloudFunc.getTitle(),
            fm      : lAdditional
        });
        
        return lData;
        
    }
    
    /**
     * init and process of appcache if it allowed in config
     */
    function appCacheProcessing() {
        var lFONT_REMOTE    = '//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff',
            lFONT_LOCAL     = './font/DroidSansMono.woff',
            lJQUERY_REMOTE  = '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
            lJQUERY_LOCAL   = './lib/client/jquery.js',
            lFiles          = [{}, {}];
            
            lFiles[0][lFONT_REMOTE]     = lFONT_LOCAL;
            lFiles[1][lJQUERY_REMOTE]   = lJQUERY_LOCAL;
        
        AppCache.addFiles(lFiles);
        AppCache.createManifest();
    }
    
    /**
     * rest interface
     * @pParams pConnectionData {request, responce}
     */
    function rest(pConnectionData) {
        return Util.exec(main.rest, pConnectionData);
    }
    
    function init() {
        var lServerDir,  lArg, lParams, lFiles;
        
        if (update)
            update.get();
        
        /* Determining server.js directory
         * and chang current process directory
         * (usually /) to it.
         * argv[1] - is always script name
         */
        lServerDir = path.dirname(process.argv[1]) + '/';
        
        if (DIR !== lServerDir) {
            Util.log('current dir: ' + DIR);
            process.chdir(lServerDir);
        }
        
        Util.log('server dir: ' + lServerDir);
        
        /* if command line parameter testing resolved 
         * setting config to testing, so server
         * not created, just init and
         * all logs writed to screen */
        lArg = process.argv;
        lArg = lArg[lArg.length - 1];
        
        if ( lArg === 'test' ||  lArg === 'test\r') {
            Util.log(process.argv);
            Config.server  = false;
        }
        
        if (Config.logs) {
            Util.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            writeLogsToFile();
        }
        
        lParams = {
            appcache    : appCacheProcessing,
            rest        : rest,
            route       : route
        },
        
        lFiles = [FILE_TMPL, PATH_TMPL, INDEX_TMPL];
        
        if (Config.ssl)
            lFiles.push(CA, KEY, CERT);
        
        main.readFiles(lFiles, function(pErrors, pFiles) {
            if (pErrors)
                Util.log(pErrors);
            else {
                FileTemplate    = pFiles[FILE_TMPL].toString();
                PathTemplate    = pFiles[PATH_TMPL].toString();
                IndexTemplate   = pFiles[INDEX_TMPL].toString();
                
                if (Config.ssl)
                    lParams.ssl = {
                        ca      : pFiles[CA],
                        key     : pFiles[KEY],
                        cert    : pFiles[CERT]
                    };
                
                server.start(lParams);
            }
        });
    }
    
    function readConfig(pCallBack) {
        fs.readFile(CONFIG_PATH, function(pError, pData) {
            var msg, status, str, readed;
            
            if (pError) 
                status = 'error';
            else {
                status = 'ok';
                str    = pData.toString(),
                readed = Util.parseJSON(str);
                
                main.config = Config = readed;
            }
                
            msg = CloudFunc.formatMsg('read', 'config', status);
            Util.log(msg);
            
            Util.exec(pCallBack);
        });
    }
    
    /**
     * routing of server queries
     */
    function route(pParams) {
        var lRet = main.checkParams(pParams);
        
        if (lRet) {
            var p = pParams;
            
            if ( Util.strCmp(p.name, ['/auth', '/auth/github']) ) {
                Util.log('* Routing' +
                    '-> ' + p.name);
                
                pParams.name    = main.HTMLDIR + p.name + '.html';
                lRet            = main.sendFile( pParams );
            }
            else if ( Util.isContainStrAtBegin(p.name, FS) || Util.strCmp( p.name, '/') )
                lRet = sendContent( pParams );
            
            else
                lRet = false;
        }
        
        return lRet;
    }
    
    function sendContent(pParams) {
        var p, lRet = main.checkParams(pParams);
        
        if (lRet) {
            p       = pParams;
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || main.SLASH;
            
            fs.stat(p.name, function(pError, pStat) {
                if (!pError)
                    if ( pStat.isDirectory() )
                        processContent(pParams);
                    else
                        main.sendFile( pParams );
                else
                    main.sendError(pParams, pError);
           });
        }
        
        return lRet;
    }
    
    function processContent(pParams) {
        var p,
            lRet = main.checkParams(pParams);
        
        if (lRet) {
            p = pParams;
            main.commander.getDirContent(p.name, function(pError, pJSON) {
                var lQuery, isJSON, lPanel, lList,
                    config  = main.config,
                    minify  = config.minify;
                
                if (pError) 
                    main.sendError(pParams, pError);
                else {
                    lQuery      = main.getQuery(p.request);
                    isJSON      = Util.isContainStr(lQuery, 'json');
                    
                    if (isJSON) {
                        p.data  = Util.stringifyJSON(pJSON);
                        p.name +='.json';
                        main.sendResponse(p, null, true);
                    }
                    else {
                        p.name  = INDEX,
                        lPanel  = CloudFunc.buildFromJSON(pJSON, FileTemplate, PathTemplate),
                        lList   = '<ul id=left class=panel>'  + lPanel + '</ul>' +
                                  '<ul id=right class=panel>' + lPanel + '</ul>';
                        
                        main.sendResponse(p, indexProcessing({
                            additional  : lList,
                            data        : IndexTemplate,
                        }), true);
                    }
                }
            });
        }
    }
    
    
    /* function sets stdout to file log.txt */
    function writeLogsToFile() {
        var stdout      = process.stdout,
            writeFile   = fs.createWriteStream('log.txt'),
            write       = writeFile.write.bind(writeFile);
        
        stdout.write    = write;
    }
})();