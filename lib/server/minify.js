/* Обьект для сжатия скриптов и стилей по умолчанию - сжимаються */

 (function(){
    "use strict";
    
    var main        = global.cloudcmd.main,
        DIR         = main.DIR,
        LIBDIR      = main.LIBDIR;
    
    exports.Minify = {
        /* pathes to directories */
        INDEX           : DIR + 'index.html', 
        /* приватный переключатель минимизации */
        _allowed               :{
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
            
        /*
         * Функция минимизирует css/js/html
         * если установлены параметры минимизации
         */
        doit                    :(function(){
            var lMinify      = main.require('minify');
            
            if(!lMinify){
                this._allowed = {js:false,css:false,html:false};
                
                console.log('You coud install minify '  +
                    'for better download spead:\n'      +
                    'npm i minify');
                
                return this._allowed;
            }
            
            /*
             * temporary changed dir path,
             * becouse directory lib is write
             * protected by others by default
             * so if node process is started
             * from other user (root for example
             * in nodester) we can not write
             * minified versions
             */
            this.MinFolder = lMinify.MinFolder;
            
            var lOptimizeParams = [],
                lStyleCSS  = DIR + 'css/style.css',
                lResetCSS  = DIR + 'css/reset.css';
            if (this._allowed.js) {
                lOptimizeParams.push(LIBDIR + 'client.js');
            }
            
            if (this._allowed.html)
                lOptimizeParams.push(this.INDEX);
            
            if (this._allowed.css) {
                var lStyles = [];
                
                lStyles[0] = {};
                lStyles[0][lStyleCSS]   = this._allowed.img;
                lStyles[1] = {};
                lStyles[1][lResetCSS]   = this._allowed.img;
                
                lOptimizeParams.push(lStyles[0]);
                lOptimizeParams.push(lStyles[1]);
            }
            
            if (lOptimizeParams.length)
                lMinify.optimize(lOptimizeParams);
                    
            this.Cache = lMinify.Cache;
            
            return this._allowed;
        }),
        
        optimize: function(pName, pParams){
            var lResult = true;
            
            pParams.force = this.force;
            
            if(this._allowed.css ||
                this._allowed.js ||
                this._allowed.html){
                    var lMinify      = main.require('minify');
                    
                    if(lMinify)
                        lMinify.optimize(pName, pParams);
                    else{
                        lResult = false;
                        
                        this._allowed = {js:false,css:false,html:false};
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
        Cache       : {}
    };
})();
