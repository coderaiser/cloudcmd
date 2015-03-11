/* global Util */
/* global DOM */

(function(Util, DOM, localStorage, exec, json, type) {
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
            var ret = Allowed && !!localStorage;
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
            
            exec(callback, null, ret);
                
            return this;
        };
        
        this.removeMatch = function(string, callback) {
            var reg = RegExp('^' + string + '.*$');
            
            Object.keys(localStorage).forEach(function(name) {
                var is = reg.test(name);
                
                if (is)
                    localStorage.removeItem(name);
            });
            
            exec(callback);
            
            return this;
        };
        
        /** если доступен localStorage и
         * в нём есть нужная нам директория -
         * записываем данные в него
         */
        this.set         = function(name, data, callback) {
            var str, error;
            
            if (type.object(data))
                str = json.stringify(data);
            
            if (Allowed && name)
                error = exec.try(function() {
                    localStorage.setItem(name, str || data);
                });
            
            exec(callback, error);
            
            return this;
        },
        
        /** Если доступен Storage принимаем из него данные*/
        this.get        = function(name, callback) {
            var ret;
            
            if (Allowed)
                ret = localStorage.getItem(name);
            
            exec(callback, null, ret);
                
            return this;
        },
        
        /** функция чистит весь кэш для всех каталогов*/
        this.clear       = function(callback) {
            var ret = Allowed;
            
            if (ret)
                localStorage.clear();
            
            exec(callback, null, ret);
            
            return this;
        };
    }
})(Util, DOM, localStorage, Util.exec, Util.json, Util.type);
