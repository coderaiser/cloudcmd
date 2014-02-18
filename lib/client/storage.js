var Util, DOM;

(function(Util, DOM) {
    'use strict';
   
        
    var Storage     = Util.extendProto(StorageProto),
        DOMProto    = Object.getPrototypeOf(DOM);
    
    Util.extend(DOMProto, {
        Storage: Storage
    });
   
   function StorageProto() {
        /* приватный переключатель возможности работы с кэшем */
        var Allowed;
        
        /* функция проверяет возможно ли работать с кэшем каким-либо образом */
        this.isAllowed   = function() {
            var ret = Allowed && !!window.localStorage;
            return ret;
        };
        
        /**
         * allow Storage usage
         */
        this.setAllowed = function(isAllowed) {
            Allowed = isAllowed;
        };
        
        /** remove element */
        this.remove      = function(item) {
            var ret = this;
            
            if (Allowed)
                localStorage.removeItem(item);
                
            return ret;
        };
        
        /** если доступен localStorage и
         * в нём есть нужная нам директория -
         * записываем данные в него
         */
        this.set         = function(name, data) {
            var ret = this;
            
            if (Allowed && name)
                localStorage.setItem(name, data);
            
            return ret;
        },
        
        /** Если доступен Storage принимаем из него данные*/
        this.get        = function(name) {
            var ret;
            
            if (Allowed)
                ret = localStorage.getItem(name);
                
            return ret;
        },
        
        /* get all Storage from local storage */
        this.getAll     = function() {
            var ret = null;
            
            if (Allowed)
                ret = localStorage;
            
            return ret;
        };
        
        /** функция чистит весь кэш для всех каталогов*/
        this.clear       = function() {
            var ret = this;
            
            if (Allowed)
                localStorage.clear();
            
            return ret;
        };
    }
})(Util, DOM);
