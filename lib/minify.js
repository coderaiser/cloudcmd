/* Модуль сжатия js-скриптов и css*/

/* функция сжимает js-скрипты 
 * и сохраняет их с именем .min.js
 */
 
var fs = require('fs');
    
exports.jsScripts=function jsScripts(){
    'use strict';    
    
    /* подключаем модуль uglify-js
     * если его нет - дальнейшая 
     * работа функции не имеет смысла
     */
    try{
        var jsp = require("uglify-js").parser;
        var pro = require("uglify-js").uglify;
    }catch(error){
        console.log('can\'n load uglify-js\n'                  +
            'to use js-minification you need to install uglify-js\n'    +
                'npm install uglify-js\n'                               +
                'https://github.com/mishoo/UglifyJS');
        return false;
    }
    /* Константы */
    var CLIENT_JS='client.js';
    var CLOUDFUNC_JS='lib/cloudfunc.js';
      
    var dataReaded_f=function(pFileName, pData){
            console.log('file ' + pFileName + ' readed');
            
            /*********************************/
            /* сжимаем код через uglify-js */
            var uglify_js=function(pDdata){
                var orig_code = pDdata.toString();
                var ast = jsp.parse(orig_code); // parse code and get the initial AST
                ast = pro.ast_mangle(ast); // get a new AST with mangled names
                ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
                var result_code = pro.gen_code(ast); // compressed code here
                return result_code;
            };
            /*********************************/
            var final_code=uglify_js(pData);
            
            var minFileName=pFileName.replace('.js','.min.js');
            /* если мы сжимаем client.js -
             * меняем строку cloudfunc.js на
             * cloudfunc.min.js и выводим сообщение
             * если другой файл - ничего не деалем
             */
            (pFileName===CLIENT_JS)?
                console.log('file name of ' +
                    CLOUDFUNC_JS            +
                    ' in '                  +
                    CLIENT_JS               +
                    ' changed. size:',
                    (final_code=final_code.replace(CLOUDFUNC_JS,
                        CLOUDFUNC_JS.replace('.js',
                            '.min.js'))).length):
                '';            
            /* записываем сжатый js-скрипт*/
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
        };
     console.log('reading file ' + CLIENT_JS+'...');
    fs.readFile(CLIENT_JS,fileReaded(CLIENT_JS,dataReaded_f));
    
    console.log('reading file ' + CLOUDFUNC_JS+'...');
    fs.readFile(CLOUDFUNC_JS,fileReaded(CLOUDFUNC_JS,dataReaded_f));    
    
    return true;
};

/* функция сжимает css-стили 
 * и сохраняет их с именем .min.css
 */
exports.cssStyles=function cssStyles(){
    'use strict';       
    
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var cleanCSS;
     try{
        cleanCSS = require('clean-css');
    }catch(error){
        console.log('can\'n load clean-css \n'                 +
            'to use css-minification you need to install clean-css \n'  +
                'npm install clean-css\n'                               +
                'https://github.com/GoalSmashers/clean-css');
        return false;
    }
    
    /* Константы */
    var STYLE_CSS='style.css';
    var RESET_CSS='reset.css';
    
    var lAllStyle='';
    var lResetCssDone=false;
    var lStyleCssDone=false;
    var dataReaded_f=function(pFileName, pData){
        console.log('file ' + pFileName + ' readed');                
        /*********************************/
        /* сжимаем код через clean-css */
        var clean_css=function(pData){
            /* Сохраняем весь стиль в одну переменную*/            
            return cleanCSS.process(pData);
        };
        /*********************************/
        var final_code=clean_css(pData);
        
        lAllStyle+=final_code;
        
        var minFileName=pFileName.replace('.css','.min.css');           
           
        if(pFileName===STYLE_CSS)lStyleCssDone=true;
        if(pFileName===RESET_CSS)lResetCssDone=true;
        /* if all files writed we
         * save all minimized css 
         * to one file all.min.css
         */
        (lStyleCssDone && lResetCssDone)?
            fs.writeFile('all.min.css', lAllStyle, fileWrited('all.min.css')):'';
         
         /* записываем сжатый css файл*/
        fs.writeFile(minFileName, final_code, fileWrited(minFileName));
    };
    
    console.log('reading file ' + STYLE_CSS+'...');
    fs.readFile(STYLE_CSS,fileReaded(STYLE_CSS,dataReaded_f));
    
    console.log('reading file ' + RESET_CSS+'...');
    fs.readFile(RESET_CSS,fileReaded(RESET_CSS,dataReaded_f));    
    
    return true;
};

/* функция сжимает css-стили 
 * и сохраняет их с именем .min.css
 */
exports.html=function(){
    'use strict';       
    
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var htmlMinifier;
     try{
        htmlMinifier = require('html-minifier');
    }catch(error){
        console.log('can\'n load html-minifier \n'                 +
            'to use html-minification you need to install html-minifier\n'  +
                'npm install html-minifier\n'                               +
                'https://github.com/kangax/html-minifier');
        return false;
    }
    
    /* Константы */
    var INDEX_HTML='index.html';
    
    var dataReaded_f=function(pFileName, pData){
        console.log('file ' + pFileName + ' readed');                
        /*********************************/
        /* сжимаем код через clean-css */
        var html_minify=function(pData){
            /* Сохраняем весь стиль в одну переменную*/            
            
            var lOptions={
                removeComments:                 true,
                removeCommentsFromCDATA:        true,
                removeCDATASectionsFromCDATA:   true,
                collapseWhitespace:             true,
                collapseBooleanAttributes:      true,
                removeAttributeQuotes:          true,
                removeRedundantAttributes:      true,
                useShortDoctype:                true,
                removeEmptyAttributes:          true,
                /* оставляем, поскольку у нас
                 * в элемент fm генерируеться
                 * таблица файлов
                 */
                removeEmptyElements:            false,
                removeOptionalTags:             true,
                removeScriptTypeAttributes:     true,
                removeStyleLinkTypeAttributes:  true
            };
            
            
            return htmlMinifier.minify(pData,lOptions);
        };
        /*********************************/
        var final_code=html_minify(pData);
                
        var minFileName=pFileName.replace('.html','.min.html');
                    
         /* записываем сжатый html файл*/
        fs.writeFile(minFileName, final_code, fileWrited(minFileName));
    };
    
    console.log('reading file ' + INDEX_HTML+'...');
    fs.readFile(INDEX_HTML,fileReaded(INDEX_HTML,dataReaded_f));
    
    return true;
};



/* Функция создаёт асинхроную версию 
 * для чтения файла
 * @pFileName - имя считываемого файла
 */
function fileReaded(pFileName,pCompressFunc){
    "use strict";
    return function(pError,pData){
        /* функция в которую мы попадаем,
         * если данные считались
         *
         * если ошибка - показываем её
         * иначе если переданная функция -
         * функция запускаем её
         */        
        pError?console.log(pError):
            ((pCompressFunc && typeof pCompressFunc==="function")?
                pCompressFunc(pFileName,pData.toString()):'');
    };
}

/*
 * Функция вызываеться после записи файла
 * и выводит ошибку или сообщает,
 * что файл успешно записан
 */
function fileWrited(pFileName){
    "use strict";
    return function(error){
        console.log(error?error:('file '+pFileName+' writed...'));
    };
}
