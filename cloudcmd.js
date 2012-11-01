"use strict";

var DIR         = process.cwd() + '/',
    LIBDIR      = DIR + 'lib/',
    SRVDIR      = LIBDIR + 'server/',
        
    srvfunc     = require(SRVDIR + 'srvfunc'),
    path        = require('path'),
    fs          = require('fs'),
    Server      = srvfunc.require(DIR + 'server'),
    CloudFunc   = srvfunc.require(LIBDIR +'cloudfunc'),
    update      = srvfunc.require(SRVDIR + 'update'),
    
    srv         = Server.CloudServer,    
    Config      = readConfig();

Server.start(Config, indexProcessing);

if(update)
    update.get();

function indexProcessing(pIndex, pList){    
    var lWin32 = process.platform === 'win32';
    
    /* если выбрана опция минифизировать скрпиты
     * меняем в index.html обычные css на
     * минифицированый
     */
    if(srv.Minify._allowed.css){       
        var lReplace_s = '<link rel=stylesheet href=';
        if(lWin32)
            lReplace_s = lReplace_s + '/css/reset.css>';
        else
            lReplace_s = lReplace_s + '"/css/reset.css">';
        
        pIndex = pIndex.replace(lReplace_s, '');
        pIndex = pIndex.replace('/css/style.css', srv.Minify.MinFolder + 'all.min.css');
    }
    
    pIndex = pIndex.replace('<div id=fm class=no-js>',
        '<div id=fm class=no-js>'+ pList);
    
    /* меняем title */
    pIndex = pIndex.replace('<title>Cloud Commander</title>',
        '<title>' + CloudFunc.setTitle() + '</title>');
    
    if(!srv.Config.appcache){
        if(lWin32)
            pIndex = pIndex.replace(' manifest=/cloudcmd.appcache', '');
        else
            pIndex = pIndex.replace(' manifest="/cloudcmd.appcache"', '');
    }
    
    return pIndex;
    
}

function appCacheProcessing(){
    var lAppCache = srv.AppCache;
    /* создаём файл app cache */    
    if(srv.Config.appcache && lAppCache && srv.Config.server){
        var lFiles = [{'//themes.googleusercontent.com/static/fonts/droidsansmono/v4/ns-m2xQYezAtqh7ai59hJUYuTAAIFFn5GTWtryCmBQ4.woff' : './font/DroidSansMono.woff'},
            {'//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js' : './lib/client/jquery.js'}];
        
        if(srv.Minify._allowed.css)
            lFiles.push('./min/all.min.css');
        
        lAppCache.addFiles(lFiles);
        lAppCache.createManifest();
    }
}

function readConfig(){
    
    /* Determining server.js directory
     * and chang current process directory
     * (usually /) to it.
     * argv[1] - is always script name
     */
    var lServerDir = path.dirname(process.argv[1]),
        lProcessDir = process.cwd();
        lConfig     = {};
    
    if(lProcessDir !== lServerDir){
        console.log('current dir: ' + lProcessDir);
        process.chdir(lServerDir);
    }
    console.log('server dir:  ' + lServerDir);
    
    console.log('reading configuretion file config.json...');
    var lConfig = srvfunc.require(DIR + 'config');
    if(lConfig){
        console.log('config.json readed');
        
        /* if command line parameter testing resolved 
         * setting config to testing, so server
         * not created, just init and
         * all logs writed to screen
         */
        var lArg = process.argv[process.argv.length - 1];
        if ( lArg === 'test' ||  lArg === 'test\r') {
            console.log(process.argv);
            lConfig.server  = false;
            lConfig.logs    = false;
        }
                    
        if (lConfig.logs) {
            console.log('log param setted up in config.json\n' +
                'from now all logs will be writed to log.txt');
            writeLogsToFile();
        }        
    }
        
    return lConfig;
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
