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
        DIR                 = main.DIR,
        LIBDIR              = main.LIBDIR,
        HTMLDIR             = main.HTMLDIR,
        Util                = main.util,
        Minify              = main.require('minify'),
        IsChanged           = main.ischanged,
        
        COULD_NOT_MINIFY    = 'Could not minify without minify module\n' +
                            'npm i minify';
    
    exports.Minify = {
        /* pathes to directories */
        INDEX           : HTMLDIR + 'index.html',
        
        optimize: function(pName, pParams) {
            if (!Minify) {
                Util.log(COULD_NOT_MINIFY);
                Util.exec(pParams.callback);
            } else {
                pParams.name    = Minify.getName(pName);
                
                if (!this.MinFolder)
                    this.MinFolder = Minify.MinFolder;
                
                IsChanged.isFileChanged(pName, function(pChanged) {
                    if(pChanged)
                        Minify.optimize(pName, pParams);
                    else
                        Util.exec(pParams.callback, pParams);
                });
            }
        },
        
        /* minification folder name */
        MinFolder   : '',
        getName     : Minify ? Minify.getName : Util.retParam
    };
    
})();
