(function(){
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
        
        FileTemplate, PathTemplate,
        
        FS          = CloudFunc.FS;
        /* reinit main dir os if we on Win32 should be backslashes */
        DIR         = main.DIR;
    
    readConfig(init);
    
    
    /**
     * additional processing of index file
     */
    function indexProcessing(pData){
        var lPath, lReplace, lKeysPanel,
            lData       = pData.data,
            lAdditional = pData.additional;
        
        /*
         * если выбрана опция минимизировать скрипты
         * меняем в index.html обычные css на
         * минифицированый
         */
        if (Minify.allowed.css){
            lPath   = '/' + Util.removeStr(Minify.MinFolder, DIR);
            lReplace = '<link rel=stylesheet href="/css/reset.css">';
            lData   = Util.removeStr(lData, lReplace)
                    .replace('/css/style.css', lPath + 'all.min.css');
        }
        
        lData = Util.render(lData, {
            title   : CloudFunc.getTitle(),
            fm      : lAdditional
        });
        
        if (!Config.appcache)
            lData = Util.removeStr(lData, ' manifest="/cloudcmd.appcache"');
        
        if (!Config.show_keys_panel){
            lKeysPanel  = '<div id=keyspanel';
            lData       = lData.replace(lKeysPanel, lKeysPanel +' class=hidden');
        }
        
        return lData;
        
    }
    
    /**
     * init and process of appcache if it allowed in config
     */
    function appCacheProcessing(){
        var lFONT_REMOTE    = '//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff',
            lFONT_LOCAL     = './font/DroidSansMono.woff',
            lJQUERY_REMOTE  = '//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js',
            lJQUERY_LOCAL   = './lib/client/jquery.js',
            lFiles          = [{}, {}];
            
            lFiles[0][lFONT_REMOTE]     = lFONT_LOCAL;
            lFiles[1][lJQUERY_REMOTE]   = lJQUERY_LOCAL;
        
        if (Config.minification.css)
            lFiles.push('node_modules/minify/min/all.min.css');
        
        AppCache.addFiles(lFiles);
        AppCache.createManifest();
    }
    
    /**
     * Функция минимизирует css/js/html
     * если установлены параметры минимизации
     */
    function minimize(pAllowed){
        var lOptimizeParams = [],
            lStyleCSS   = DIR + 'css/style.css',
            lResetCSS   = DIR + 'css/reset.css',
            
            lCSSOptions = {
                img     : pAllowed.img,
                merge   : true
            };
            
        if (pAllowed.js)
            lOptimizeParams.push(LIBDIR + 'client.js');
        
        if (pAllowed.html)
            lOptimizeParams.push(INDEX);
        
        if (pAllowed.css) {
            var lStyles = [{}, {}];
            lStyles[0][lStyleCSS]   = lCSSOptions;
            lStyles[1][lResetCSS]   = lCSSOptions;
            
            lOptimizeParams.push(lStyles[0]);
            lOptimizeParams.push(lStyles[1]);
        }
        
        if (lOptimizeParams.length)
            Minify.optimize(lOptimizeParams, {
                force: true
            });
    }
    
    /**
     * rest interface
     * @pParams pConnectionData {request, responce}
     */
    function rest(pConnectionData){
        return Util.exec(main.rest, pConnectionData);
    }
    
    function init(){
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
        
        Util.log('server dir:  ' + lServerDir);
        Util.log('reading configuration file config.json...');
        
        if (Config) {
            Util.log('config.json readed');
            
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
            
            if (Config.server)
                Util.tryCatchLog(function(){
                    fs.watch(CONFIG_PATH, function(){
                        /* every catch up - calling twice */
                        setTimeout(function() {
                            readConfig();
                        }, 1000);
                    });
                });
            
            lParams = {
                appcache    : appCacheProcessing,
                minimize    : minimize,
                rest        : rest,
                route       : route
            },
            
            lFiles = [FILE_TMPL, PATH_TMPL];
            
            if (Config.ssl)
                lFiles.push(CA, KEY, CERT);
            
            main.readFiles(lFiles, function(pErrors, pFiles){
                if (pErrors)
                    Util.log(pErrors);
                else {
                    FileTemplate        = pFiles[FILE_TMPL].toString();
                    PathTemplate    = pFiles[PATH_TMPL].toString();
                    
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
        else
            Util.log('read error: config.json');
    }
    
    function readConfig(pCallBack){
        fs.readFile(CONFIG_PATH, function(pError, pData){
            if (!pError){
                Util.log('config: readed');
                
                var lStr            = pData.toString(),
                    lReadedConf     = Util.parseJSON(lStr);
                
                if (!Config.minification)
                    main.config = Config = lReadedConf;
                
                Util.tryCatchLog(function(){
                    Config.minification.js  = lReadedConf.minification.js;
                    Config.cache            = lReadedConf.cache;
                    
                    Minify.setAllowed(Config.minification);
                });
            }
            else
                Util.log(pError);
            
            Util.exec(pCallBack);
        });
    }
    
    /**
     * routing of server queries
     */
    function route(pParams){
        var lRet = main.checkParams(pParams);
        
        if (lRet){
            var p = pParams;
            
            if ( Util.strCmp(p.name, ['/auth', '/auth/github']) ){
                Util.log('* Routing' +
                    '-> ' + p.name);
                
                pParams.name    = main.HTMLDIR + p.name + '.html';
                lRet            = main.sendFile( pParams );
            }
            else if ( Util.isContainStrAtBegin(p.name, FS) || Util.strCmp( p.name, '/') ){
                
                if ( Util.isContainStrAtBegin(p.name, FS + 'no-js/') ){
                    var lURL = Util.removeStr(pParams.name, 'no-js/');
                    return main.redirect(pParams, lURL);
                }
                
                lRet = sendCommanderContent( pParams );
            }
            /* termporary redirect for old urls */
            else
                lRet = false;
        }
        
        return lRet;
    }
    
    function sendCommanderContent(pParams){
        var p, lRet = main.checkParams(pParams);
        
        if (lRet){
            p       = pParams;
            p.name  = Util.removeStrOneTime(p.name, CloudFunc.FS) || main.SLASH;
            
            fs.stat(p.name, function(pError, pStat){
                if (!pError)
                    if ( pStat.isDirectory() )
                        processCommanderContent(pParams);
                    else
                        main.sendFile( pParams );
                else
                    main.sendError(pParams, pError);
           });
        }
        
        return lRet;
    }
    
    function processCommanderContent(pParams){
        var lRet = main.checkParams(pParams);
        
        if (lRet){
            var p = pParams;
            main.commander.getDirContent(p.name, function(pError, pJSON){
                if (!pError){
                    var lQuery = main.getQuery(p.request);
                    if ( Util.isContainStr(lQuery, 'json') ){
                        p.data  = Util.stringifyJSON(pJSON);
                        p.name +='.json';
                        main.sendResponse(p);
                    }
                    else{ /* get back html*/
                        p.name   = Minify.allowed.html ? Minify.getName(INDEX) : INDEX;
                        fs.readFile(p.name, function(pError, pData){
                            if (!pError){
                                var lPanel  = CloudFunc.buildFromJSON(pJSON, FileTemplate, PathTemplate),
                                    lList   = '<ul id=left class=panel>'  + lPanel + '</ul>' +
                                              '<ul id=right class=panel>' + lPanel + '</ul>';
                                
                                main.sendResponse(p, indexProcessing({
                                    additional  : lList,
                                    data        : pData.toString(),
                                }));
                            }
                            else
                                main.sendError(pParams, pError);
                        });
                    }
                }
                else
                    main.sendError(pParams, pError);
            });
        }
    }
    
    
    /* function sets stdout to file log.txt */
    function writeLogsToFile(){
        var stdo = fs.createWriteStream('./log.txt');
        
        process.stdout.write = (function(write) {
            return function(string, encoding, fd) {
                    stdo.write(string);
            };
        })(process.stdout.write);
    }
})();