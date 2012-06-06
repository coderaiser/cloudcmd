/* Модуль сжатия js-скриптов*/
/*
    https://github.com/GoalSmashers/clean-css
*/
exports.jsScripts=jsScripts;

function jsScripts(){
    'use strict';    
    
    /* подключаем модуль uglify-js
     * если его нет - дальнейшая 
     * работа модуля не имеет смысла
     */
    try{
        var jsp = require("uglify-js").parser;
        var pro = require("uglify-js").uglify;
    }catch(error){
        return console.log('ERROR. error loading minificatoin js\n' +
            'to use minification you need to install uglify-js\n'   +
                'npm install uglify-js\n'                           +
                'https://github.com/mishoo/UglifyJS\n'              +
                error);
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
                var orig_code = data.toString();
                var ast = jsp.parse(orig_code); // parse code and get the initial AST
                ast = pro.ast_mangle(ast); // get a new AST with mangled names
                ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
                var final_code = pro.gen_code(ast); // compressed code here
                /*********************************/
                
                var minFileName=pFileName.replace('.js','.min.js');
                /* если мы сжимаем client.js -
                 * меняем строку cloudfunc.js на
                 * cloudfunc.min.js и выводим сообщение
                 * если другой файл - ничего не деалем
                 */
                (pFileName===CLIENT_JS)?
                    console.log('file name of '+CLOUDFUNC_JS+' in '+CLIENT_JS+' changed. size:',
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