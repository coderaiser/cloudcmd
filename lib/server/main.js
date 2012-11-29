(function(){
    "strict mode";

    /* Global var accessible from any loaded module */
    global.cloudcmd     = {};
    
    var DIR,
        LIBDIR,
        SRVDIR,
        Util,
        
        SLASH,
        ISWIN32,
        path,
        
        OK              = 200,
        ERROR           = 404,
        Extensions      = {
            '.css'      : 'text/css',
            '.js'       : 'text/javascript',
            '.png'      : 'image/png',
            '.json'     : 'application/json',
            '.html'     : 'text/html',
            '.woff'     : 'font/woff',
            '.appcache' : 'text/cache-manifest',
            '.mp3'      : 'audio/mpeg'
        };
    
    
    /* Native Modules*/
    exports.crypto                  = require('crypto'),
    exports.child_process           = require('child_process'),
    exports.fs                      = require('fs'),
    exports.http                    = require('http'),
    exports.https                   = require('https'),
    exports.path        = path      = require('path'),
    exports.url                     = require('url'),
    exports.querystring             = require('querystring'),
    
    /* Constants */
    /* current dir + 2 levels up */
    exports.WIN32       = ISWIN32   = isWin32();
    exports.SLASH       = SLASH     = ISWIN32 ? '\\' : '/',

    exports.SRVDIR      = SRVDIR    = __dirname + SLASH,
    exports.LIBDIR      = LIBDIR    = path.normalize(SRVDIR + '../'),
    exports.DIR         = DIR       = path.normalize(LIBDIR + '../'),
    
    /* Functions */
    exports.generateHeaders         = generateHeaders,
    exports.sendFile                = sendFile,
    exports.require                 = mrequire,
    exports.librequire              = librequire,
    exports.srvrequire              = srvrequire,
    exports.rootrequire             = rootrequire,
    
    /* compitability with old versions of node */
   exports.fs.exists                = exports.fs.exists || exports.path.exists;
    
    /* Needed Modules */
    exports.util    = Util          = require(LIBDIR + 'util'),
    
    exports.zlib                    = mrequire('zlib'),
    
    /* Main Information */
    exports.config                  = rootrequire('config');
    exports.mainpackage             = rootrequire('package');
    
    /* Additional Modules */
    
    /* 
     * Any of loaded below modules could work with global var so
     * it should be initialized first. Becouse of almost any of
     * moudles do not depends on each other all needed information
     * for all modules is initialized hear.
     */
    global.cloudcmd.main            = exports;
    
    exports.auth                    = srvrequire('auth').auth,
    exports.appcache                = srvrequire('appcache'),
    exports.cache                   = srvrequire('cache').Cache,
    exports.cloudfunc               = librequire('cloudfunc'),
    exports.rest                    = srvrequire('rest').api,
    exports.socket                  = srvrequire('socket'),
    exports.update                  = srvrequire('update'),
    exports.minify                  = srvrequire('minify').Minify;
    /*
     * second initializing after all modules load, so global var is
     * totally filled of all information that should know all modules
     */
    var main = global.cloudcmd.main            = exports;
    
    /**
     * function do safe require of needed module
     * @param {Strin} pSrc
     */
    function mrequire(pSrc){
        var lModule,        
        lError = Util.tryCatch(function(){
            lModule = require(pSrc);
        });
        
        if(lError)
            console.log(lError);
        
        return lModule;
    }
    
    function rootrequire(pSrc){ return mrequire(DIR + pSrc); }
    
    function librequire(pSrc){ return mrequire(LIBDIR + pSrc); }

    function srvrequire(pSrc){ return mrequire(SRVDIR + pSrc); }
    
    /**
     * function check is current platform is win32
     */
    function isWin32(){ return process.platform === 'win32'; }
    
    /**
     * Функция создаёт заголовки файлов
     * в зависимости от расширения файла
     * перед отправкой их клиенту
     * @param pName - имя файла
     * @param pGzip - данные сжаты gzip'ом
     */
    function generateHeaders(pName, pGzip, pQuery){
        var lType               = '',
            lCacheControl       = 0,
            lContentEncoding    = '',
            lRet,
            
            lDot                = pName.lastIndexOf('.'),
            lExt                = pName.substr(lDot);
        
        if( Util.strCmp(lExt, '.appcache') )
            lCacheControl = 1;
        
        lType = Extensions[lExt] || 'text/plain';
        
        if( !Util.isContainStr(lType, 'img') )
            lContentEncoding = '; charset=UTF-8';
        
        if(Util.strCmp(pQuery, 'download') )
            lType = 'application/octet-stream';
        
        
        if(!lCacheControl)
            lCacheControl = 31337 * 21;
            
        lRet = {
            /* if type of file any, but img - 
             * then we shoud specify charset 
             */
            'Content-Type': lType + lContentEncoding,
            'cache-control': 'max-age=' + lCacheControl,
            'last-modified': new Date().toString(),        
            /* https://developers.google.com/speed/docs/best-practices
                /caching?hl=ru#LeverageProxyCaching */
            'Vary': 'Accept-Encoding'
        };
        
        if(pGzip)
            lRet['content-encoding'] = 'gzip';
            
        return lRet;
}
        
    /**
     * send file to client thru pipe
     * and gzip it if client support
     * 
     * @param pName - имя файла
     * @param pGzip - данные сжаты gzip'ом
     */
    function sendFile(pParams){
        var lRet    = false,
            lName   = pParams.name,
            lReq    = pParams.request,
            lRes    = pParams.response,
                        
            lEnc = lReq.headers['accept-encoding'] || '',
            lGzip = lEnc.match(/\bgzip\b/),
            lReadStream;
        
         main.fs.exists(lName, function(pExist){
            lRet = pExist;
            if(pExist){
                lReadStream = main.fs.createReadStream(lName, {
                    'bufferSize': 4 * 1024
                });                
                lRes.writeHead(OK, generateHeaders(lName, lGzip) );
                
                if (lGzip)
                    lReadStream = lReadStream.pipe( main.zlib.createGzip() );
                
                lReadStream.pipe(lRes);
            }
            else{
                var lJson = JSON.stringify({
                    error: 'File not Found'
                });
                
                lRes.writeHead(ERROR, 'OK');
                lRes.end(lJson);
            }
        });
        
        return lRet;
    }
    
})();
