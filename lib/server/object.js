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
    CSSDIR          :'./css',
    INDEX           :'index.html',   
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
           this._allowed.css=pAllowed.css; 
           this._allowed.js=pAllowed.js; 
           this._allowed.html=pAllowed.html; 
           this._allowed.img=pAllowed.img; 
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
                    try{
                        console.log(pError);
                        lMinify      = require('minify');                        
                    }catch(pError){
                        return console.log('Could not minify'   +
                            'withou minify module\n'            +
                            'for fixing type:\n'                +
                            'git submodule init\n'              +
                            'git submodule update\n'            +
                            'or\n'                              +
                            'npm i minify');
                    }
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
                
                /* post processing function for file
                 * client.js
                 */
                var lPostProcessing_f = function(pFinalCode){
                    console.log('file name of ' +
                        'cloudfunc.js'          +
                        ' in '                  +
                        'client.js'             +
                        ' changed. size:',
                    (pFinalCode = pFinalCode
                        .replace('cloudfunc.js','cloudfunc.min.js')
                            .replace('keyBinding.js','keyBinding.min.js')
                                .replace('/lib/', lMinFolder)
                                    .replace('/lib/client/',
                                        lMinFolder)).length);
                    return pFinalCode;
                };
                
                this.done.js=this._allowed.js?
                    lMinify.jsScripts([{
                        'client.js': lPostProcessing_f},
                        'lib/cloudfunc.js',
                        'lib/client/keyBinding.js'],
                        true)
                :false;
                                                                
                this.done.html=this._allowed.html?
                    lMinify.html(this.INDEX):false;
                
                this.done.css=this._allowed.css?
                    lMinify.cssStyles([this.CSSDIR + '/style.css',
                        this.CSSDIR + '/reset.css'],
                        this._allowed.img):false;
                        
                this.Cache = lMinify.Cache;
        }
    }),
    /* свойство показывающее случилась ли ошибка*/
    done:{js: false,css: false, html:false},
    
    /* minification folder name */
    MinFolder   :'',
    Cache       :{}    
};