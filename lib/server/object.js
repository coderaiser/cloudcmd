/* Module contains Cloud Commander SS(Server Side) objects.
 *
 * List of objects:
 * - Cache
 * - Minify
 */

/* 
 * Обьект для работы с кэшем
 * аналог клиентского обьекта
 * с тем отличием, что в нём
 * будут храниться серверные
 * данные, такие как файлы
 * отдаваемые клиенту
 * (файлы проэкта по большому
 * счёту, для ускорения
 * первичной загрузки)
 */
exports.Cache={
    /* приватный переключатель возможности работы с кэшем */
    _allowed            :true,
    /* данные в которых храняться файлы 
     * в формате <поле> : <значение>
     * _data[name]=pData;
     * одному имени соответствуют 
     * одни данные
     */
    _data               :{},
    
    /* функция говорит можно ли работать с кэшем */
    isAllowed           :(function(){
        return this._allowed;
        }),
    /* функция устанавливает возможность работать с кэшем */
    setAllowed          :(function(pAllowed){
        this._allowed=pAllowed;
    }),
    /* Если доступен кэш
     * сохраняем в него данные
     */
    set                  :(function(pName, pData){
        if(this._allowed && pName && pData){
            this._data[pName]=pData;
        }
    }),
    /* Если доступен Cache принимаем из него данные*/
    get                 :(function(pName){
        if(this._allowed && pName){
            return this._data[pName];
        }
        else return null;
    }),
    
    /* Функция очищает кэш*/
    clear               :(function(){
        if(this._allowed){
            this._data={};
        }
    })
};

/* Обьект для сжатия скриптов и стилей
 * по умолчанию - сжимаються
 */
exports.Minify={
    /* pathes to directories */
    INDEX           :'index.html',
    LIBDIR          : './lib/',
    LIBDIRCLIENT    : './lib/client/',
    /* приватный переключатель минимизации */
    _allowed               :{css:true,js:true,html:true, img: true},
    
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
           this._allowed=pAllowed;           
       }
    }),
        
    /*
     * Функция минимизирует css/js/html
     * если установлены параметры минимизации
     */
    doit                    :(function(){
        if(this._allowed.css ||
            this._allowed.js ||
            this._allowed.html){
                var lMinify;
                try{
                    lMinify      = require('minify');
                }catch(pError){
                    this._allowed={js:false,css:false,html:false};
                    return console.log('Could not minify '  +
                        'withou minify module\n'            +                        
                        'npm i minify');
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
                this.MinFolder = '/' + lMinify.MinFolder;
                var lMinFolder=this.MinFolder;
                
                var lOptimizeParams = [];
                if (this._allowed.js) {                
                
                var lJSFiles = ['cloudfunc.js',
                                 'keyBinding.js',
                                 'editor.js',
                                 'viewer.js'];
                                
                /* post processing function for file
                 * client.js
                 */
                
                /* если мы сжимаем client.js -
                 * меняем строку cloudfunc.js на
                 * cloudfunc.min.js и выводим сообщение
                 *
                 * меняем строку keyBinding.js на
                 * keyBinding.min.js
                 * если другой файл - ничего не деалем
                 */             
                var lPostProcessing_f = function(pFinalCode){
                    console.log('file names in client.js changed from *.js ' +
                        'to *.min.js:');
                    
                    var getMinName_f = function(pName){
                        return pName.replace('.js','.min.js');
                    };
                    
                    console.log(lJSFiles);                    
                    for(var i=0; i < lJSFiles.length; i++){                        
                        pFinalCode = pFinalCode.replace(lJSFiles[i],
                            getMinName_f(lJSFiles[i]));
                    }
                    
                    pFinalCode = pFinalCode
                        .replace('/lib/client/', lMinFolder)
                            .replace('/lib/', lMinFolder);
                    return pFinalCode;
                };                                                                                                                                            
                    
                    
                /*
                 * Функция копирует масив целиком
                 * нужна для того, что бы копировать
                 * значения одного массива в другой
                 * без использования дополнительных
                 * функций и для создания двух
                 * независящих друг-от-друга
                 * переменных
                 * @pArray - массив
                 * Пример:
                 * m=[1,2]
                 * t=m;
                 * t[t.length]=3;
                 * t
                 * [1,2,3]
                 * m
                 * [1,2,3]
                 */
                var lArrayCopy_f = function(pArray){
                    if(Array.isArray(pArray)){
                        var lArray = [];
                        for(var i=0; i < pArray.length; i++)
                            lArray[lArray.length] = pArray[i];
                        return lArray;
                    }
                };
                    
                lOptimizeParams = lArrayCopy_f(lJSFiles);
                lOptimizeParams[0] = this.LIBDIR + lOptimizeParams[0];
                for(var i = 1; i< lOptimizeParams.length; i++)
                    lOptimizeParams[i] = this.LIBDIRCLIENT + lOptimizeParams[i];
                
                lOptimizeParams[lOptimizeParams.length] = {
                        'client.js': lPostProcessing_f};
                }
                
                if (this._allowed.html)
                    lOptimizeParams[lOptimizeParams.length] = this.INDEX;

                if (this._allowed.css) {
                    lOptimizeParams[lOptimizeParams.length] = {
                        './css/style.css' : this._allowed.img };
                    
                    lOptimizeParams[lOptimizeParams.length] = {    
                        './css/reset.css': this._allowed.img};
                }
                        
                if (lOptimizeParams)
                    lMinify.optimize(lOptimizeParams);
                        
                this.Cache = lMinify.Cache;
        }
    }),
    
    /* minification folder name */
    MinFolder   :'',
    Cache       :{}
};