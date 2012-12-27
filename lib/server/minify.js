/* Обьект для сжатия скриптов и стилей по умолчанию - сжимаються */

 (function(){
    "use strict";
    
    var main        = global.cloudcmd.main,
        DIR         = main.DIR,
        LIBDIR      = main.LIBDIR,
        HTMLDIR     = main.HTMLDIR,
        
        Minify      = main.require('minify');
    
    exports.Minify = {
        /* pathes to directories */
        INDEX           : HTMLDIR + 'index.html',
        /* приватный переключатель минимизации */
        _allowed        : {
            css     : true,
            js      : true,
            html    : true,
            img     : true
        },
        
        /* minimize even if file not changed */
        forse       : false,
        
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
        setAllowed              :(function(pAllowed){
           if(pAllowed){
               this._allowed = pAllowed;
           }
        }),
        
        optimize: function(pName, pParams){
            var lResult = true;
            
            if(!pParams)
                pParams = {};
            
            pParams.force = this.force;
            
            if(!this.MinFolder)
                this.MinFolder = Minify.MinFolder;
            if(!this.Cache)
                this.Cache = Minify.Cache;
            
            if(this._allowed.css || this._allowed.js || this._allowed.html){
                if(Minify)
                    Minify.optimize(pName, pParams);
                else{
                    lResult = false;
                    
                    this._allowed = {
                        js      : false,
                        css     : false,
                        html    : false};
                    
                    console.log('Could not minify ' +
                        'without minify module\n'   +
                        'npm i minify');
                }
            }
            else lResult = false;
            
            return lResult;
        },
                
        /* minification folder name */
        MinFolder   : '',
        Cache       : null
    };
})();
