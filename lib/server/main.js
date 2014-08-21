(function() {
    'use strict';
    
    /* Global var accessible from any loaded module */
    global.cloudcmd     = {};
    
    var DIR, LIBDIR, SRVDIR, JSONDIR, HTMLDIR,
        Util,
        UTIL = 'util',
        
        SLASH,
        ext,
        zlib, CloudFunc, diffPatch, path,
        
        Config = {
            server  : true,
            socket  : true,
            port    : 80
        };
    
    path                                    = require('path'),
    
    /* Constants */
    exports.SLASH       = SLASH             = '/',
        
    exports.SRVDIR      = SRVDIR            = __dirname + SLASH,
    exports.LIBDIR      = LIBDIR            = path.normalize(SRVDIR + '../'),
    exports.DIR         = DIR               = path.normalize(LIBDIR + '../'),
    exports.HTMLDIR     = HTMLDIR           = DIR + 'html' + SLASH,
    exports.JSONDIR     = JSONDIR           = DIR + 'json' + SLASH,
    
    /* Functions */
    exports.require                         = mrequire,
    exports.librequire                      = librequire,
    exports.srvrequire                      = srvrequire,
    exports.rootrequire                     = rootrequire,
    exports.quietrequire                    = quietrequire,
    
    /* we can not use librequare here */
    exports.util        = Util              = require(LIBDIR + UTIL),
    
    /* Main Information */
    exports.modules                         = jsonrequire('modules');
    exports.ext         = ext               = jsonrequire('ext');
    exports.mainpackage                     = rootrequire('package');
    /* base configuration */
    exports.config                          = Config,
    
    
    /* 
     * Any of loaded below modules could work with global var so
     * it should be initialized first. Becouse of almost any of
     * moudles do not depends on each other all needed information
     * for all modules is initialized hear.
     */
    global.cloudcmd.main                    = exports;
    
    /* Additional Modules */
    exports.cloudfunc   = CloudFunc         = librequire('cloudfunc'),
    exports.socket                          = srvrequire('socket'),
    exports.auth                            = srvrequire('auth').auth,
    diffPatch                               = librequire('diff/diff-match-patch').diff_match_patch,
    exports.diff                            = new (librequire('diff').DiffProto)(diffPatch),
    exports.rest                            = srvrequire('rest').api;
    
    /* second initializing after all modules load, so global var is   *
     * totally filled of all information that should know all modules */
    global.cloudcmd.main            = exports;
    
    /**
     * function do safe require of needed module
     * @param {Strin} src
     */
    function mrequire(src) {
        var module, msg,
            error = Util.exec.try(function() {
                module = require(src);
            });
        
        if (error)
            if (error.code === 'MODULE_NOT_FOUND')
                msg = CloudFunc.formatMsg('require', src, 'no');
            else
                Util.log(error);
        
        Util.log(msg);
        
        return module;
    }
    
    function quietrequire(src) {
        var module;
        
        Util.exec.try(function() {
            module = require(src);
        });
        
        return module;
    }
    
    function rootrequire(src) { return mrequire(DIR + src); }
    
    function librequire(src) { return mrequire(LIBDIR + src); }
    
    function srvrequire(src) { return mrequire(SRVDIR + src); }
    
    function jsonrequire(src) { return mrequire(JSONDIR + src);}
})();
