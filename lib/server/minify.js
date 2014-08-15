/* Обьект для сжатия скриптов и стилей */

 (function() {
    'use strict';
    
   if(!global.cloudcmd)
        return console.log(
            '# minify.js'                                       + '\n'  +
            '# -----------'                                     + '\n'  +
            '# Module is part of Cloud Commander,'              + '\n'  +
            '# used for work with minification.'                + '\n'  +
            '# If you wont to see at work set minify'           + '\n'  +
            '# parameters in config.json or environment'        + '\n'  +
            '# and start cloudcmd.js'                           + '\n'  +
            '# http://cloudcmd.io'                              + '\n');
    
    var main                = global.cloudcmd.main,
        HTMLDIR             = main.HTMLDIR,
        Util                = main.util,
        Minify              = main.require('minify'),
        fs                  = require('fs'),
        ischanged           = require('./ischanged'),
        
        COULD_NOT_MINIFY    = 'Could not minify without minify module\n' +
                            'npm i minify';
    
    /* pathes to directories */
    exports.INDEX           = HTMLDIR + 'index.html';
    exports.optimize        = function(name, params, callback) {
        var minifyName, isChanged, isExist,
            exec    = Util.exec;
        
        Util.checkArgs(arguments, ['name', 'callback']);
        
        if (!callback)
            callback = params;
        
        if (!Minify) {
            Util.log(COULD_NOT_MINIFY);
            callback();
        } else {
            minifyName  = Minify.getName(name),
            
            isChanged   = exec.with(ischanged, name),
            isExist     = exec.with(fs.lstat, minifyName);
            
            exec.parallel([isChanged, isExist], function(error, changed, exists) {
                if (changed || !exists)
                    Minify.optimize(name, params, callback);
                else
                    callback(null, {
                        name: minifyName
                    });
            });
        }
    };
    exports.getName         = Minify ? Minify.getName : Util.retParam;
    
})();
