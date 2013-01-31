(function(){
    'use strict';
    
    var DIR         = __dirname     + '/',
        main        = require(DIR   + 'lib/server/main'),
        
        LIBDIR      = main.LIBDIR,
        SRVDIR      = main.SRVDIR,
        CLIENTDIR   = LIBDIR + 'client',
        
        path        = main.path,
        fs          = main.fs,
        CloudFunc   = main.cloudfunc,
        Util        = main.util,
        update      = main.update,
        
        Server      = main.require(LIBDIR + 'server'),
        Minify      = Server.Minify,
        srv         = Server.CloudServer,
        Config      = main.config;
        
        /* reinit main dir os if we on 
         * Win32 should be backslashes */
        DIR         = main.DIR;
        
    readConfig();
    Server.start(Config, {
        appcache    : appCacheProcessing,
        index       : indexProcessing,
        minimize    : minimize,
        rest        : rest,
        route       : route
    });
    
    if(update)
        update.get();
    
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
        
        if(!srv.Config.appcache)
            lData = Util.removeStr(lData, ' manifest="/cloudcmd.appcache"');
        
        if(!srv.Config.show_keys_panel){
            var lKeysPanel = '<div id=keyspanel';
            lData = lData.replace(lKeysPanel, lKeysPanel +' class=hidden');
        }
        
        return lData;
        
    }
    
    /**
     * init and process of appcache if it allowed in config
     */
    function appCacheProcessing(){
        var lAppCache = srv.AppCache,
            lFiles = [
                {'//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff' : './font/DroidSansMono.woff'},
                {'//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js' : './lib/client/jquery.js'}];
        
        if(srv.Minify._allowed.css)
            lFiles.push('node_modules/minify/min/all.min.css');
        
        lAppCache.addFiles(lFiles);
        lAppCache.createManifest();
    }
    
    /**
     * Функция минимизирует css/js/html
     * если установлены параметры минимизации
     */
    function minimize(pAllowed){
        var lOptimizeParams = [],
            lStyleCSS   = DIR + 'css/style.css',
            lResetCSS   = DIR + 'css/reset.css',
            lIndex      = DIR + 'html/index.html',
            
            lCSSOptions = {
                img     : pAllowed.img,
                merge   : true
            };
            
        if (pAllowed.js)
            lOptimizeParams.push(LIBDIR + 'client.js');
        
        if (pAllowed.html)
            lOptimizeParams.push(lIndex);
        
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
    
    function readConfig(){
        
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
        Util.log('reading configuretion file config.json...');
        
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
    
    /**
     * routing of server queries
     */
    function route(pParams){
        var lRet,
            lName = pParams.name;
        
        if( Util.strCmp(lName, '/auth') ){
            Util.log('* Routing' +
                '-> auth');
            
            pParams.name = main.HTMLDIR + lName + '.html';
            main.sendFile(pParams);
            
            lRet = true;
        }else if( Util.strCmp(lName, '/auth/github') ){
            Util.log('* Routing' +
                '-> github');
                
            pParams.name = main.HTMLDIR + lName + '.html';
            main.sendFile(pParams);
            
            lRet = true;
        }
        
        return lRet;
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