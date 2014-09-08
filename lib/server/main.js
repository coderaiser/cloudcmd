(function() {
    'use strict';
    
    /* Global var accessible from any loaded module */
    global.cloudcmd     = {};
    
    var Util,
        
        SLASH,
        CloudFunc, path,
        
        Config = {
            server  : true,
            socket  : true,
            port    : 80
        };
    
    path                                    = require('path'),
    
    /* Constants */
    exports.SLASH       = SLASH             = '/',
    
    /* we can not use librequare here */
    Util                = require('../util'),
    
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
    CloudFunc                               = require('../cloudfunc'),
    exports.socket                          = require('./socket'),
    exports.auth                            = require('./auth').auth,
    
    /* second initializing after all modules load, so global var is   *
     * totally filled of all information that should know all modules */
    global.cloudcmd.main            = exports;
})();
