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
        Util                = require('../util'),
        Minify              = main.require('minify'),
        
        COULD_NOT_MINIFY    = 'Could not minify without minify module\n' +
                            'npm i minify';
    
    exports.optimize        = function(name, params, callback) {
        Util.checkArgs(arguments, ['name', 'callback']);
        
        if (!callback)
            callback = params;
        
        if (!Minify) {
            Util.log(COULD_NOT_MINIFY);
            callback();
        } else {
            Minify.optimize(name, params, callback);
        }
    };
})();
