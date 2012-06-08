/* Модуль сжатия js-скриптов и css*/

/* функция сжимает js-скрипты 
 * и сохраняет их с именем .min.js
 */
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
        console.log('ERROR. error loading uglify-js\n'                  +
            'to use js-minification you need to install uglify-js\n'    +
                'npm install uglify-js\n'                               +
                'https://github.com/mishoo/UglifyJS\n'                  +
                error);
        return false;
    }
    
    var fs = require('fs');
    
    /* Константы */
    var CLIENT_JS='client.js';
    var CLOUDFUNC_JS='cloudfunc.js';
    
    console.log('reading file ' + CLIENT_JS+'...');
    fs.readFile(CLIENT_JS,fileReaded(CLIENT_JS));
    
    console.log('reading file ' + CLOUDFUNC_JS+'...');
    fs.readFile(CLOUDFUNC_JS,fileReaded(CLOUDFUNC_JS));
    
    /* Функция создаёт асинхроную версию 
     * для чтения файла
     * @pFileName - имя считываемого файла
     */
    function fileReaded(pFileName){
        return function(error,data){
            /* функция в которую мы попадаем,
             * если данные считались
             */
            var dataReaded=function(){
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
                var final_code=uglify_js(data);
                
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
                var fileWrited=function(error){
                    console.log(error?error:('file '+minFileName+' writed...'));
                };
                
                /* записываем сжатый js-скрипт*/
                fs.writeFile(minFileName, final_code, fileWrited);
            };
            
            error?console.log(error):dataReaded();
        };
    }
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
        console.log('ERROR. error loading clean-css \n'                 +
            'to use css-minification you need to install clean-css \n'  +
                'npm install clean-css\n'                               +
                'https://github.com/GoalSmashers/clean-css\n'           +
                error);
        return false;
    }
    
    var source = "a{font-weight:bold;font-color:red}";
    var minimized = cleanCSS.process(source);
};