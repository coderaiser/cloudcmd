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
exports.Cache = {
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
exports.Minify = {
    /* pathes to directories */
    INDEX           :'index.html', 
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
                    this._allowed = {js:false,css:false,html:false};
                    return console.log('You coud install minify '   +
                        'for better download spead:\n'              +
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
                
                var lOptimizeParams = [];
                if (this._allowed.js) {
                    lOptimizeParams.push('client.js');
                }
                                                
                if (this._allowed.html)
                    lOptimizeParams.push(this.INDEX);

                if (this._allowed.css) {
                    lOptimizeParams.push({
                        './css/style.css' : this._allowed.img
                    });
                    
                    lOptimizeParams.push({
                        './css/reset.css': this._allowed.img
                    });
                }
                        
                if (lOptimizeParams)
                    lMinify.optimize(lOptimizeParams);
                        
                this.Cache = lMinify.Cache;
        }
    }),
    
    optimize: function(pName, pParams){
        var lResult = true;
        
        pParams.force = this.force;
        
        if(this._allowed.css ||
            this._allowed.js ||
            this._allowed.html){
                var lMinify      = cloudRequire('minify');                    
                
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

/* Обьект проверяет изменился ли файл */
exports.IsFileChanged = function(pFileName, pData, pOverWrite_b){
    var lCheck = cloudRequire('is-file-changed');
    if(lCheck){
        return lCheck.IsFileChanged(pFileName, pData, pOverWrite_b);
        
    }else    
        return true;
};

/* function do safe require of needed module */
function cloudRequire(pModule){
  try{
      return require(pModule);
  }
  catch(pError){
      return false;
  }
}