(function(){
    'strict mode';
    
    /* Global var accessible from any loaded module */
    global.cloudcmd     = {};
    
    var DIR,
        LIBDIR,
        SRVDIR,
        JSONDIR,
        Util,
        
        SLASH,
        ISWIN32,
        
        path;
    
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
    exports.HTMLDIR                 = DIR + 'html/',
    exports.JSONDIR     = JSONDIR   = DIR + 'json/',
    
    /* Functions */
    exports.require                 = mrequire,
    exports.librequire              = librequire,
    exports.srvrequire              = srvrequire,
    exports.rootrequire             = rootrequire,
    
    /* compitability with old versions of node */
    exports.fs.exists                = exports.fs.exists || exports.path.exists;
    
    /* Needed Modules */
    exports.util        = Util      = require(LIBDIR + 'util'),
    
    exports.zlib                    = mrequire('zlib'),
    
    /* Main Information */
    exports.config                  = jsonrequire('config');
    exports.modules                 = jsonrequire('modules');
    exports.ext                     = jsonrequire('ext');
    exports.mainpackage             = rootrequire('package');
    
    
    /* 
     * Any of loaded below modules could work with global var so
     * it should be initialized first. Becouse of almost any of
     * moudles do not depends on each other all needed information
     * for all modules is initialized hear.
     */
    global.cloudcmd.main            = exports;
    
    exports.VOLUMES                 = getVolumes(),
    
    /* Additional Modules */
    exports.minify                  = srvrequire('minify').Minify;
    exports.socket                  = srvrequire('socket'),
    exports.server                  = librequire('server'),
    exports.auth                    = srvrequire('auth').auth,
    exports.appcache                = srvrequire('appcache'),
    exports.cache                   = srvrequire('cache').Cache,
    exports.cloudfunc               = librequire('cloudfunc'),
    exports.rest                    = srvrequire('rest').api,
    exports.update                  = srvrequire('update'),
    exports.ischanged               = srvrequire('ischanged');
    exports.commander               = srvrequire('commander');
    /*
     * second initializing after all modules load, so global var is
     * totally filled of all information that should know all modules
     */
    global.cloudcmd.main            = exports;
    /**
     * function do safe require of needed module
     * @param {Strin} pSrc
     */
    function mrequire(pSrc){
        var lModule,
        lError = Util.tryCatchLog(function(){
            lModule = require(pSrc);
        });
        
        if(lError)
            console.log(lError);
        
        return lModule;
    }
    
    function rootrequire(pSrc){ return mrequire(DIR + pSrc); }
    
    function librequire(pSrc){ return mrequire(LIBDIR + pSrc); }
    
    function srvrequire(pSrc){ return mrequire(SRVDIR + pSrc); }
    
    function jsonrequire(pSrc){ return mrequire(JSONDIR + pSrc);}
    
    /**
     * function check is current platform is win32
     */
    function isWin32(){ return process.platform === 'win32'; }
    
    
    /**
     * get volumes if win32 or get nothing if nix
     */
    function getVolumes(){
        var lRet = ISWIN32 ? [] : '/';
                
        if(ISWIN32)
            srvrequire('win').getVolumes(function(pVolumes){
                console.log(pVolumes);
                exports.VOLUMES = pVolumes;
            });

        return lRet;
    }
})();
