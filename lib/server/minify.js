/* Модуль сжатия js-скриптов и css*/

/* функция сжимает js-скрипты 
 * и сохраняет их с именем .min.js
 */
 
var fs = require('fs');
var path=require('path');

/* CONSTANTS */
/* dir contains css-files */
var CSSDIR      = 'css/';    

/* ---------------------------------- */
console.log('minify.js loaded...');
console.log('current dir: ' + process.cwd());
/* ---------------------------------- */

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
    var CLIENT_KEYBINDING_JS='lib/client/keyBinding.js';
      
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
             *
             * меняем строку keyBinding.js на
             * keyBinding.min.js
             * если другой файл - ничего не деалем
             */             
            /*                            
             * temporary changed dir path,
             * becouse directory lib is write
             * protected by others by default
             * so if node process is started
             * from other user (root for example
             * in nodester) we can not write
             * minified versions
             */
            if(pFileName===CLIENT_JS)
                console.log('file name of ' +
                    CLOUDFUNC_JS            +
                    ' in '                  +
                    CLIENT_JS               +
                    ' changed. size:',
                    (final_code=final_code
                        .replace('cloudfunc.js','cloudfunc.min.js')
                            .replace('keyBinding.js','keyBinding.min.js')
                                .replace('/lib','')
                                    .replace('/lib/client','')).length);
            
            /* записываем сжатый js-скрипт*/
            fs.writeFile(path.basename(minFileName), final_code, fileWrited(minFileName));
        };
     console.log('reading file ' + CLIENT_JS+'...');
    fs.readFile(CLIENT_JS,fileReaded(CLIENT_JS,dataReaded_f));
    
    console.log('reading file ' + CLOUDFUNC_JS+'...');
    fs.readFile(CLOUDFUNC_JS,fileReaded(CLOUDFUNC_JS,dataReaded_f));    
    
    console.log('reading file ' + CLIENT_KEYBINDING_JS+'...');
    fs.readFile(CLIENT_KEYBINDING_JS, fileReaded(CLIENT_KEYBINDING_JS,dataReaded_f));
    
    
    return true;
};

/* функция сжимает css-стили 
 * и сохраняет их с именем .min.css
 * @pImgConvertToBase64_b - булевый признак,
 * который отвечает за то, что быконвертировать
 * картинки в base64 и поместить в выходной css файл
 */
exports.cssStyles=function cssStyles(pImgConvertToBase64_b){
    'use strict';
    
     /* connecting cleanCSS,
      * if we can't find it -
      * return false
      */
     var cleanCSS;
     try{
        cleanCSS = require('clean-css');
    }catch(error){
        console.log('can\'n load clean-css \n'                          +
            'to use css-minification you need to install clean-css \n'  +
                'npm install clean-css\n'                               +
                'https://github.com/GoalSmashers/clean-css');
        return false;
    }
    
    /* Константы */
    var STYLE_CSS   = CSSDIR+'style.css';
    var RESET_CSS   = CSSDIR+'reset.css';
    
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
        if(lStyleCssDone && lResetCssDone){
            /* если включена конвертация картинок в base64
             * вызываем её
             */
            if(pImgConvertToBase64_b)
                base64_images(lAllStyle);
            else
                fs.writeFile('all.min.css', lAllStyle, fileWrited('all.min.css'));         
        }
         /* в другом случае - записываем сжатый css файл*/
        else fs.writeFile(path.basename(minFileName), final_code, fileWrited(minFileName));
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

/* функция переводит картинки в base64 и записывает в css-файл*/
function base64_images(pFileContent_s){
    'use strict';    
     var b64img;
     try{
        b64img = require('css-b64-images');
    }catch(error){
        console.log('can\'n load clean-css \n'                 +
            'to use images to base64 convertation you need to install css-base64-images \n'  +
                'npm install -g css-b64-images\n'                               +
                'https://github.com/Filirom1/css-base64-images');
        return false;
    }
    b64img.fromString(pFileContent_s, '.','', function(err, css){
        console.log('images converted to base64 and saved in css file');
        fs.writeFile('all.min.css', css, fileWrited('all.min.css'));
    });
}

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
        if(!pError)
            if (pCompressFunc && typeof pCompressFunc==="function")
                    pCompressFunc(pFileName,pData.toString());
        else console.log(pError);
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