(function(){
    "strict mode";

    var DIR,
        LIBDIR,
        SRVDIR,
        Util,
        
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
    
    /* Constants */
    exports.DIR         = DIR       = process.cwd() + '/',
    exports.LIBDIR      = LIBDIR    = DIR + 'lib/',
    exports.SRVDIR      = SRVDIR    = LIBDIR + 'server/',
    exports.WIN32       = isWin32();    
    
    /* Functions */
    exports.generateHeaders         = generateHeaders,
    exports.require                 = mrequire,
    exports.librequire              = librequire,
    exports.srvrequire              = srvrequire,
    exports.rootrequire             = rootrequire,
    
    /* Native Modules*/
    exports.crypto                  = require('crypto'),
    exports.child_process           = require('child_process'),
    exports.fs                      = require('fs'),
    exports.http                    = require('http'),
    exports.https                   = require('https'),
    exports.path                    = require('path'),
    exports.url                     = require('url'),
    exports.querystring             = require('querystring'),
    
    /* Needed Modules */
    exports.util    = Util          = require(LIBDIR + 'util'),
    
    /* Main Information */
    exports.config                  = rootrequire('config');
    exports.mainpackage             = rootrequire('package');
    
    /* Additional Modules */
    
    exports.auth                    = srvrequire('auth').auth,
    exports.appcache                = srvrequire('appcache'),
    exports.cache                   = srvrequire('cache').Cache,
    exports.cloudfunc               = librequire('cloudfunc'),
    exports.rest                    = srvrequire('rest').api,
    exports.socket                  = srvrequire('socket'),
    exports.update                  = srvrequire('update'),
    exports.minify                  = srvrequire('minify').Minify,
    exports.zlib                    =   mrequire('zlib');

    
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
    
})();
