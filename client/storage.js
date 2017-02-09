'use strict';

const itype = require('itype/legacy');
const Util = require('../common/util');
const DOM = require('./dom');
const jonny = require('jonny');
const exec = require('execon');

const Storage = Util.extendProto(StorageProto);
const DOMProto = Object.getPrototypeOf(DOM);

Util.extend(DOMProto, {
    Storage
});

function StorageProto() {
    /* приватный переключатель возможности работы с кэшем */
    var Allowed;
    
    /* функция проверяет возможно ли работать с кэшем каким-либо образом */
    this.isAllowed = () => {
        return Allowed && !!localStorage;
    };
    
    /**
     * allow Storage usage
     */
    this.setAllowed = (isAllowed) => {
        Allowed = isAllowed;
    };
    
    /** remove element */
    this.remove = (item, callback) => {
        var ret = Allowed;
        
        if (ret)
            localStorage.removeItem(item);
        
        exec(callback, null, ret);
        
        return this;
    };
    
    this.removeMatch = (string, callback) => {
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
    this.set = (name, data, callback) => {
        var str, error;
        
        if (itype.object(data))
            str = jonny.stringify(data);
        
        if (Allowed && name)
            error = exec.try(() => {
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

