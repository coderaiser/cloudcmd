/* Модуль сжатия js-скриптов и css*/

console.log('minify.js loaded...');

/* функция сжимает js-скрипты 
 * и сохраняет их с именем .min.js
 */
 
var fs = require('fs');
var path=require('path');

var MinFolder='min/';
/* function clear MinFolder
 * if we could not create
 * directory and it is
 * not exist
 */
var folderExist = function(pError, pStat){
    "use strict";
    /*file found and it's directory */
    if(!pError && pStat.isDirectory())
        console.log('folder exist: ' + MinFolder);
    else MinFolder='/';
};

/*
 * function says thet folder created
 * if everything is OK, or
 * moves to folderExist function
 */
var makeFolder = function(pError){
    "use strict";
    /*folder created successfully*/
    if(!pError)
        console.log('folder created: min');
    else fs.stat(MinFolder,folderExist);    
};

/* Trying to create folder min
 * where woud be minifyed versions
 * of files 511(10)=777(8)
 * rwxrwxrwx
 */
fs.mkdir(MinFolder,511,makeFolder);

exports.MinFolder = MinFolder;

/* function which minificate js-files
 * @pJSFiles_a - varible, wich contain array
 * of js file names or string, if name
 * single
 */
exports.jsScripts=function jsScripts(pJSFiles_a){
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
    
    if(typeof pJSFiles_a === "string")
        pJSFiles_a=[pJSFiles_a];
    
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
                                .replace('/lib/', MinFolder)
                                    .replace('/lib/client/', MinFolder)).length);
            
            
            /* minimized file will be in min file
             * if it's possible if not -
             * in root
             */
            minFileName = MinFolder + path.basename(minFileName);
            /* записываем сжатый js-скрипт*/
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
        };
    
    /* moving thru all elements of js files array */
    for(var i=0;pJSFiles_a[i];i++){
        console.log('reading file ' + pJSFiles_a[i]+'...');
        fs.readFile(pJSFiles_a[i],fileReaded(pJSFiles_a[i],dataReaded_f));
    }
        
    return true;
};

/* функция сжимает css-стили 
 * и сохраняет их с именем .min.css
 * @pImgConvertToBase64_b - булевый признак,
 *                          который отвечает за то, что быконвертировать
 *                          картинки в base64 и поместить в выходной css файл
 * @pCSSFiles_a           - масив имен css файлов или строка,
 *                          если имя одно
 */
exports.cssStyles=function cssStyles(pCSSFiles_a, pImgConvertToBase64_b){
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
            
    if(typeof pCSSFiles_a === "string")
        pCSSFiles_a=[pCSSFiles_a];
    /* Varible contains information
     * about readed css file
     */
    var lCSSFiles_doneCount=0;
    
    var lAllStyle='';
    
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
           
        ++lCSSFiles_doneCount;
        
        /* if all files writed we
         * save all minimized css 
         * to one file all.min.css
         */                
        if(pCSSFiles_a.length === lCSSFiles_doneCount){
            /* если включена конвертация картинок в base64
             * вызываем её
             */
            if(pImgConvertToBase64_b)
                base64_images(lAllStyle);
            else
                fs.writeFile(MinFolder + 'all.min.css', lAllStyle, fileWrited(MinFolder + 'all.min.css'));
        }
         /* в другом случае - записываем сжатый css файл*/
        else{
            minFileName = MinFolder + path.basename(minFileName); 
            fs.writeFile(minFileName, final_code, fileWrited(minFileName));
        }
    };
    
   /* moving thru all elements of css files array */
    for(var i=0;pCSSFiles_a[i];i++){
        console.log('reading file ' + pCSSFiles_a[i]+'...');
        fs.readFile(pCSSFiles_a[i],fileReaded(pCSSFiles_a[i],dataReaded_f));
    }
        
    return true;
};

/* функция сжимает html файлы
 * и сохраняет их с именем .min.html
 * @pHTMLFiles_a - массим имен html
 * файлов, или строка если имя одно
 */
exports.html=function(pHTMLFiles_a){
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
        
    if(typeof pHTMLFiles_a === "string")
        pHTMLFiles_a=[pHTMLFiles_a];
    
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
                    
         /* adding Min folder to file path */
         minFileName = MinFolder + minFileName;
         /* записываем сжатый html файл*/
        fs.writeFile(minFileName, final_code, fileWrited(minFileName));
    };
    
    
     /* moving thru all elements of css files array */
    for(var i=0;pHTMLFiles_a[i];i++){
        console.log('reading file ' + pHTMLFiles_a[i]+'...');
        fs.readFile(pHTMLFiles_a[i],fileReaded(pHTMLFiles_a[i],dataReaded_f));
    }
    
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
        fs.writeFile(MinFolder + 'all.min.css', css, fileWrited(MinFolder + 'all.min.css'));
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