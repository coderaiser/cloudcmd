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
        this.remove      = function(item, callback) {
            var ret = Allowed;
            
            if (ret)
                localStorage.removeItem(item);
            
            Util.exec(callback, ret);
                
            return this;
        };
        
        this.removeMatch = function(string, callback) {
            var name, is,
                reg = new RegExp('^' + string + '.*$');
            
            for (name in localStorage) {
                is = name.match(reg); 
                
                if (is)
                    localStorage.removeItem(name);
            }
            
            Util.exec(callback);
            
            return this;
        };
        
        /** если доступен localStorage и
         * в нём есть нужная нам директория -
         * записываем данные в него
         */
        this.set         = function(name, data, callback) {
            var str, ret = Allowed && name;
            
            if (Util.isObject(data))
                str = Util.stringifyJSON(data);
            
            if (Allowed && name)
                localStorage.setItem(name, str || data);
            
            Util.exec(callback, ret);
            
            return this;
        },
        
        /** Если доступен Storage принимаем из него данные*/
        this.get        = function(name, callback) {
            var ret;
            
            if (Allowed)
                ret = localStorage.getItem(name);
            
            Util.exec(callback, null, ret);
                
            return this;
        },
        
        /** функция чистит весь кэш для всех каталогов*/
        this.clear       = function(callback) {
            var ret = Allowed;
            
            if (ret)
                localStorage.clear();
            
            Util.exec(callback, ret);
            
            return this;
        };
    }
})(Util, DOM);
