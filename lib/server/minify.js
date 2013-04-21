/* Обьект для сжатия скриптов и стилей */

 (function(){
    'use strict';
    
   if(!global.cloudcmd)
        return console.log(
            '# minify.js'                                      + '\n'  +
            '# -----------'                                    + '\n'  +
            '# Module is part of Cloud Commander,'             + '\n'  +
            '# used for work with minification.'               + '\n'  +
            '# If you wont to see at work set minify'          + '\n'  +
            '# parameters in config.json or environment'       + '\n'  +
            '# and start cloudcmd.js'                          + '\n'  +
            '# http://coderaiser.github.com/cloudcmd'          + '\n');
    
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
        /* приватный переключатель минимизации */
        allowed        : {
            css     : true,
            js      : true,
            html    : true,
            img     : true
        },
        
        /* функция разрешает или 
         * запрещает минимизировать
         * css/js/html
         * @pAllowed: - структура, в которой
         *              передаються параметры
         *              минификации, вида
         *              {js:true,css:true,html:false; img:true}
         * img отвечает за перевод картинок в base64
         * и сохранение их в css-файл
         */
        setAllowed              :function(pAllowed){
           this.allowed = pAllowed && Minify ? pAllowed : {
                js      : false,
                css     : false,
                html    : false
            };
        },
        
        optimize: function(pName, pParams){
            var lRet;
            if(Minify){
                pParams.name    = Minify.getName(pName);
                
                lRet = this.allowed.css || this.allowed.js || this.allowed.html;
                
                if(!this.MinFolder)
                    this.MinFolder = Minify.MinFolder;
                
                if(pParams && pParams.force)
                    Minify.optimize(pName, pParams);
                else if(lRet)
                    IsChanged.isFileChanged(pName, function(pChanged){
                        if(pChanged)
                            Minify.optimize(pName, pParams);
                        else
                            Util.exec(pParams.callback, pParams);
                    });
            }
            else{
                this.allowed = {
                    js      : false,
                    css     : false,
                    html    : false
                };
                    
                Util.log(COULD_NOT_MINIFY);
            }
            
            return lRet;
        },
        
        /* minification folder name */
        MinFolder   : '',
        getName     : Minify ? Minify.getName : Util.retParam
    };
    
})();
