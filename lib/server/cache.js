(function(){    
    "use strict";
    
    var main        = global.cloudcmd.main,
        SRVDIR      = main.SRVDIR;
    
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
})();
