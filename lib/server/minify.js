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
        IsChanged           = main.ischanged,
        
        COULD_NOT_MINIFY    = 'Could not minify without minify module\n' +
                            'npm i minify';
    
    exports.Minify = {
        /* pathes to directories */
        INDEX           : HTMLDIR + 'index.html',
        
        optimize: function(name, params) {
            if (!Minify) {
                Util.log(COULD_NOT_MINIFY);
                Util.exec(params.callback);
            } else {
                params.name    = Minify.getName(name);
                
                if (!this.MinFolder)
                    this.MinFolder = Minify.MinFolder;
                
                IsChanged.isFileChanged(name, function(changed) {
                    if (changed)
                        Minify.optimize(name, params);
                    else
                        Util.exec(params.callback, params);
                });
            }
        },
        
        /* minification folder name */
        MinFolder   : '',
        getName     : Minify ? Minify.getName : Util.retParam
    };
    
})();
