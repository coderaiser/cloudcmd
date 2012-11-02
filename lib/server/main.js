(function(){
    "strict mode";

    var DIR,
        LIBDIR,
        SRVDIR,
        Util;
    
    /* Constants */
    exports.DIR         = DIR       = process.cwd()             + '/',
    exports.LIBDIR      = LIBDIR    = DIR                       + 'lib/',
    exports.SRVDIR      = SRVDIR    = LIBDIR                    + 'server/',
    exports.WIN32       = isWin32();    
    
    /* Functions */
    exports.require     = mrequire,
    exports.librequire  = librequire,
    exports.srvrequire  = srvrequire,
    exports.rootrequire = rootrequire,
    
    /* Native Modules*/
    exports.path                    = require('path'),
    exports.fs                      = require('fs'),
    exports.querystring             = require('querystring'),
    exports.child_process           = require('child_process'),
    exports.https                   = require('https'),
    
    /* Needed Modules */
    exports.util    = Util          = require(LIBDIR    + 'util'),
    
    /* Main Information */
    exports.config                  = rootrequire('config');
    exports.mainpackage             = rootrequire('package');
    
    /* Additional Modules */
    
    exports.zlib                    = mrequire('zlib'),
    exports.cloudfunc               = librequire('cloudfunc'),
    exports.update                  = srvrequire('update'),
    exports.appcache                = srvrequire('appcache'),
    exports.auth                    = srvrequire('auth'),
    exports.socket                  = srvrequire('socket'),
    exports.object                  = srvrequire('object');

    
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
    
    function rootrequire(pSrc){     
        return mrequire(DIR + pSrc);
    }
    
    function librequire(pSrc){
        return mrequire(LIBDIR + pSrc);
    }

    function srvrequire(pSrc){     
        return mrequire(SRVDIR + pSrc);
    }
    
    /**
     * function check is current platform is win32
     */
    function isWin32(){
        return process.platform === 'win32';
    }
}());