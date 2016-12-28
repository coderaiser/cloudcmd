(function(scope) {
    'use strict';
    
    var exec,
        rendy,
        jonny,
        Scope = scope.window ? window : global;
    
    if (typeof module === 'object' && module.exports) {
        exec = require('execon');
        rendy = require('rendy');
        jonny = require('jonny');
        module.exports = new UtilProto(exec);
    } else if (!Scope.Util) {
        exec = window.exec;
        rendy = window.rendy;
        jonny = window.jonny;
        Scope.Util = new UtilProto(exec);
    }
    
    function UtilProto(exec) {
        var Util = this;
        
        this.getStrBigFirst = getStrBigFirst;
        this.kebabToCamelCase = kebabToCamelCase;
        
        /**
         * Copy properties from from to to
         *
         * @param from
         * @param to
         */
        this.copyObj                = function(to, from) {
            if (!from) {
                from    = to;
                to      = {};
            }
            
            if (to)
                Object.keys(from).forEach(function(name) {
                    to[name]    = from[name];
                });
            
            return to;
        };
        
        /**
         * copy objFrom properties to target
         *
         * @target
         * @objFrom
         */
        this.extend                 = function(target, objFrom) {
            var obj,
                keys,
                proto,
                isFunc  = Util.type.function(objFrom),
                isArray = Util.type.array(objFrom),
                isObj   = Util.type.object(target),
                ret     = isObj ? target : {};
            
            if (isArray)
                objFrom.forEach(function(item) {
                   ret = Util.extend(target, item);
                });
                   
            
            else if (objFrom) {
                obj     = isFunc ? new objFrom() : objFrom;
                keys    = Object.keys(obj);
                
                if (!keys.length) {
                    proto = Object.getPrototypeOf(objFrom);
                    keys  = Object.keys(proto);
                }
                
                keys.forEach(function(name) {
                    ret[name] = obj[name];
                });
            }
            
            return ret;
        };
        
        /**
         * extend proto
         *
         * @obj
         */
        this.extendProto           = function(obj) {
            var ret, F      = function() {};
            F.prototype     = Util.extend({}, obj);
            ret             = new F();
            
            return ret;
        };
        
        this.json               = jonny;
        
        this.escapeRegExp = function(str) {
            var isStr   = Util.type.string(str);
            
            if (isStr)
                str = str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            
            return str;
        };
        
        /**
         * get regexp from wild card
         */
        this.getRegExp              = function(wildcard) {
            var regExp;
            
            if (!wildcard)
                wildcard = '*';
            
            wildcard    = '^' + wildcard /* search from start of line */
                .replace('.', '\\.')
                .replace('*', '.*')
                .replace('?', '.?');
            
            wildcard    += '$'; /* search to end of line */
            
            regExp      = new RegExp(wildcard);
            
            return regExp;
        };
        
        this.type                   = new TypeProto();
        
        function TypeProto() {
            /**
             * get type of variable
             *
             * @param variable
             */
            function type(variable) {
                var regExp      = /\s([a-zA-Z]+)/,
                    str         = {}.toString.call(variable),
                    typeBig     = str.match(regExp)[1],
                    result      = typeBig.toLowerCase();
                
                return result;
            }
            
            /**
             * functions check is variable is type of name
             *
             * @param variable
             */
            function typeOf(name, variable) {
                return type(variable) === name;
            }
            
            function typeOfSimple(name, variable) {
                return typeof variable === name;
            }
            
            ['null', 'arrayBuffer', 'file', 'array', 'object']
                .forEach(function(name) {
                    type[name] = typeOf.bind(null, name);
                });
            
            ['string', 'undefined', 'boolean', 'number', 'function']
                .forEach(function(name) {
                    type[name] = typeOfSimple.bind(null, name);
                });
            
            return type;
        }
        
        this.exec                       = exec;
        
        /**
         * function gets file extension
         *
         * @param pFileName
         * @return Ext
         */
        this.getExt                     = function(name) {
            var ret     = '',
                dot,
                isStr   = Util.type.string(name);
            
            if (isStr) {
                dot = name.lastIndexOf('.');
                
                if (~dot)
                    ret = name.substr(dot);
            }
            
            return ret;
        };
        
       /**
         * get values from Object Array name properties
         * or
         * @pObj
         */
        this.getNamesFromObjArray       = function(arr) {
            var ret     = [];
            
            if (!Array.isArray(arr))
                throw Error('arr should be array!');
            
            ret = arr.map(function(item) {
                return item.name;
            });
            
            return ret;
        };
        
        /**
         * find object by name in arrray
         *
         * @param array
         * @param name
         */
        this.findObjByNameInArr         = function(array, name) {
            var ret;
            
             if (!Array.isArray(array))
                throw Error('array should be array!');
                
            if (typeof name !== 'string')
                throw Error('name should be string!');
            
            array.some(function(item) {
                var is = item.name === name,
                    isArray = Array.isArray(item);
                
                if (is)
                    ret = item;
                else if (isArray)
                    item.some(function(item) {
                        is = item.name === name;
                        
                        if (is)
                            ret = item.data;
                        
                        return is;
                    });
                
                return is;
            });
            
            return ret;
        };
        
        /**
         * start timer
         * @param name
         */
        this.time                       = function(name) {
            var console     = Scope.console;
            
            Util.exec.ifExist(console, 'time', [name]);
            
            return this;
        };
        
        /**
         * stop timer
         * @param name
         */
        this.timeEnd                   = function(name) {
            var console    = Scope.console;
            
            Util.exec.ifExist(console, 'timeEnd', [name]);
            
            return this;
        };
        
        function getStrBigFirst(str) {
            if (!str)
                throw Error('str could not be empty!');
            
            var first = str[0].toUpperCase();
            return first + str.slice(1);
        }
        
        function kebabToCamelCase(str) {
            if (!str)
                throw Error('str could not be empty!');
            
            return str
                .split('-')
                .map(getStrBigFirst)
                .join('')
                .replace(/.js$/, '');
        }
        
    }
    
})(this);
