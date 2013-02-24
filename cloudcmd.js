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
        
        REQUEST     = 'request',
        RESPONSE    = 'response',
        INDEX       = main.INDEX,
        CONFIG_PATH = JSONDIR + 'config.json',
        FS          = CloudFunc.FS;
        
        /* reinit main dir os if we on 
         * Win32 should be backslashes */
        DIR         = main.DIR;
        
    readConfig(init);
    
    
    /**
     * additional processing of index file
     */
    function indexProcessing(pData){
        var lReplace_s,
            lData       = pData.data,
            lAdditional = pData.additional;
        
        /*
         * если выбрана опция минимизировать скрипты
         * меняем в index.html обычные css на
         * минифицированый
         */
        if(Minify.allowed.css){
            var lPath = '/' + Minify.MinFolder.replace(DIR, '');
            lReplace_s = '<link rel=stylesheet href="/css/reset.css">';
            lData = Util.removeStr(lData, lReplace_s)
                    .replace('/css/style.css', lPath + 'all.min.css');
        }
        
        /* меняем title */
        lReplace_s = '<div id=fm class=no-js>';
        lData = lData.replace(lReplace_s, lReplace_s + lAdditional)
                .replace('<title>Cloud Commander</title>', 
                    '<title>' + CloudFunc.getTitle() + '</title>');
        
        if(!Config.appcache)
            lData = Util.removeStr(lData, ' manifest="/cloudcmd.appcache"');
        
        if(!Config.show_keys_panel){
            var lKeysPanel = '<div id=keyspanel';
            lData = lData.replace(lKeysPanel, lKeysPanel +' class=hidden');
        }
        
        return lData;
        
    }
    
    /**
     * init and process of appcache if it allowed in config
     */
    function appCacheProcessing(){
        var lFiles = [
                {'//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff' : './font/DroidSansMono.woff'},
                {'//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js' : './lib/client/jquery.js'}];
        
        if(Config.minification.css)
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
     * @pConnectionData {request, responce}
     */
    function rest(pConnectionData){
        return Util.exec(main.rest, pConnectionData);
    }
    
    function init(){
        fs.watch(CONFIG_PATH, function(){
            /* every catch up - calling twice */
            setTimeout(function() {
                readConfig();
            }, 1000);
        });
            
        server.start({
            appcache    : appCacheProcessing,
            minimize    : minimize,
            rest        : rest,
            route       : route
        });
    
        if(update)
            update.get();
        
        /* Determining server.js directory
         * and chang current process directory
         * (usually /) to it.
         * argv[1] - is always script name
         */
        var lServerDir = path.dirname(process.argv[1]) + '/';
        
        if( DIR !== lServerDir ){
            Util.log('current dir: ' + DIR);
            process.chdir(lServerDir);
        }
        Util.log('server dir:  ' + lServerDir);
        Util.log('reading configuration file config.json...');
        
        if(Config){
            Util.log('config.json readed');
            
            /* if command line parameter testing resolved 
             * setting config to testing, so server
             * not created, just init and
             * all logs writed to screen
             */        
            var lArg = process.argv;
                lArg = lArg[lArg.length - 1];
            if ( lArg === 'test' ||  lArg === 'test\r') {
                Util.log(process.argv);
                Config.server  = 
                Config.logs    = false;
            }
            
            if (Config.logs) {
                Util.log('log param setted up in config.json\n' +
                    'from now all logs will be writed to log.txt');
                writeLogsToFile();
            }
        }
    }
    
    function readConfig(pCallBack){
        fs.readFile(CONFIG_PATH, function(pError, pData){
            if(!pError){
                Util.log('config: readed');
                
                var lStr            = pData.toString(),
                    lReadedConf     = Util.parseJSON(lStr);
                
                if(!Config.minification)
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
        var lRet = Util.checkObjTrue( pParams, ['name', REQUEST, RESPONSE] );
        
        if(lRet){
            var p = pParams;
            
            if( Util.strCmp(p.name, ['/auth', '/auth/github']) ){
                Util.log('* Routing' +
                    '-> ' + p.name);
                pParams.name = main.HTMLDIR + p.name + '.html';
                lRet = main.sendFile( pParams );
            }
            else if( Util.isContainStr(p.name, FS) || Util.strCmp( p.name, '/') ){
                if( Util.isContainStr(p.name, 'no-js/') )
                    return noJSTMPRedirection(pParams);
                    
                lRet = sendCommanderContent(p);
            }
            /* termporary redirect for old urls */
            else
                lRet = false;
        }
        
        return lRet;
    }
    
    function sendCommanderContent(pParams){
        var lRet = Util.checkObjTrue( pParams, ['name', REQUEST, RESPONSE] );
        if(lRet){
            var p  = pParams;
            p.name = Util.removeStr(p.name, CloudFunc.FS) || main.SLASH;
            
            fs.stat(p.name, function(pError, pStat){
                if(!pError)
                    if( pStat.isDirectory() )
                        processCommanderContent(pParams);
                    else
                        main.sendFile(p);
                else
                    sendError(pParams, pError);
            
           });
        }
    }
    
    function processCommanderContent(pParams){
        var lRet = Util.checkObjTrue( pParams, ['name', REQUEST, RESPONSE] );
        if(lRet){
            var p = pParams;
            main.commander.getDirContent(p.name, function(pError, pJSON){
                if(!pError){
                    var lQuery = main.getQuery(p.request);
                    if(lQuery === 'json'){
                        p.data  = Util.stringifyJSON(pJSON);
                        p.name +='.json';
                        main.sendResponse(p);
                    }
                    else if(!lQuery){ /* get back html*/
                        var lName   = Minify.allowed.html ?
                            Minify.getName(INDEX) : INDEX;
                        fs.readFile(lName, function(pError, pData){
                            if(!pError){
                                var lPanel  = CloudFunc.buildFromJSON(pJSON),
                                    lList   = '<ul id=left class=panel>'  + lPanel + '</ul>' +
                                              '<ul id=right class=panel>' + lPanel + '</ul>';
                                
                                p.data = indexProcessing({
                                    additional  : lList,
                                    data        : pData,
                                });
                                
                                main.sendResponse(p);
                            }
                            else
                                sendError(pParams, pError);
                        });
                    }
                }
                else
                    sendError(pParams, pError);
            });
        }
    }
    
    function sendError(pParams, pError){
        var lRet = Util.checkObjTrue(pParams,
            ['name', 'data', 'request', 'response']);
        
        if(lRet){
            var p       = pParams;
            p.status    = main.FILE_NOT_FOUND;
            p.data      = pError;
            main.sendResponse(p);
        }
    }
    
    function noJSTMPRedirection(pParams){
        var MOVED_PERMANENTLY = 301,
            lPath = Util.removeStr(pParams.name, 'no-js/');
        
        pParams.response.writeHead(MOVED_PERMANENTLY, {'Location': lPath});
        pParams.response.end();
        
        return true;
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