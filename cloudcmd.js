(function(){
    "use strict";
    
    var DIR         = process.cwd() + '/',
        main        = require(DIR + 'lib/server/main'),
        
        LIBDIR      = main.LIBDIR,
        SRVDIR      = main.SRVDIR,
        
        path        = main.path,
        fs          = main.path,    
        CloudFunc   = main.cloudfunc,
        Util        = main.util,
        update      = main.update,
        
        Server      = main.require(DIR + 'server'),
        srv         = Server.CloudServer,
        Config      = main.config,
        WIN32       = main.WIN32;
    
    readConfig();
    Server.start(Config, indexProcessing, appCacheProcessing);
    
    if(update)
        update.get();
    
    
    function indexProcessing(pIndex, pList){
        /* если выбрана опция минифизировать скрпиты
         * меняем в index.html обычные css на
         * минифицированый
         */
        if(srv.Minify._allowed.css){       
            var lReplace_s = '<link rel=stylesheet href=' + 
                (WIN32 ? '/css/reset.css>' : '"/css/reset.css">');
            
            pIndex = Util.removeStr(pIndex, lReplace_s);
            pIndex = pIndex.replace('/css/style.css', srv.Minify.MinFolder + 'all.min.css');
        }
        
        pIndex = pIndex.replace('<div id=fm class=no-js>',
            '<div id=fm class=no-js>'+ pList);
        
        /* меняем title */
        pIndex = pIndex.replace('<title>Cloud Commander</title>',
            '<title>' + CloudFunc.setTitle() + '</title>');
        
        if(!srv.Config.appcache)
            pIndex = Util.removeStr(pIndex, ' manifest="/cloudcmd.appcache"');
        
        return pIndex;
        
    }
    
    function appCacheProcessing(){
        var lAppCache = srv.AppCache,
    
            lFiles = [
                {'//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff' : './font/DroidSansMono.woff'},
                {'//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js' : './lib/client/jquery.js'}];
        
        if(srv.Minify._allowed.css)
            lFiles.push('./min/all.min.css');
        
        lAppCache.addFiles(lFiles);
        lAppCache.createManifest();
    }
    
    function readConfig(){
        
        /* Determining server.js directory
         * and chang current process directory
         * (usually /) to it.
         * argv[1] - is always script name
         */
        var lServerDir = path.dirname(process.argv[1]);
        
        if( DIR !== lServerDir ){
            console.log('current dir: ' + DIR);
            process.chdir(lServerDir);
        }
        console.log('server dir:  ' + lServerDir + '\n' +
            'reading configuretion file config.json...');
        
        if(Config){
            console.log('config.json readed');
            
            /* if command line parameter testing resolved 
             * setting config to testing, so server
             * not created, just init and
             * all logs writed to screen
             */        
            var lArg = process.argv;
                lArg = lArg[lArg.length - 1];
            if ( lArg === 'test' ||  lArg === 'test\r') {
                console.log(process.argv);
                Config.server  = 
                Config.logs    = false;
            }
                        
            if (Config.logs) {
                console.log('log param setted up in config.json\n' +
                    'from now all logs will be writed to log.txt');
                writeLogsToFile();
            }        
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