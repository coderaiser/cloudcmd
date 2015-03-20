(function(scope) {
    'use strict';
    
    var Scope = scope.window ? window : global;
    
    if (typeof module === 'object' && module.exports)
        module.exports = new UtilProto();
    else if (!Scope.Util)
        Scope.Util = new UtilProto();
    
    function UtilProto() {
        var Util = this;
        
        this.check              = new checkProto();
        
        function checkProto() {
            /**
             * Check is all arguments with names present
             *
             * @param name
             * @param arg
             * @param type
             */
            var check = function check(args, names) {
                var msg         = '',
                    name        = '',
                    template    = '{{ name }} coud not be empty!',
                    
                    indexOf     = Array.prototype.indexOf,
                    
                    lenNames    = names.length,
                    lenArgs     = args.length,
                    lessArgs    = lenArgs < lenNames,
                    emptyIndex  = indexOf.call(args),
                    isEmpty     = ~emptyIndex;
                
                if (lessArgs || isEmpty) {
                    if (lessArgs)
                        name        = names[lenNames - 1];
                    else
                        name        = names[emptyIndex];
                    
                    msg         = Util.render(template, {
                        name: name
                    });
                    
                    throw(Error(msg));
                }
                
                return check;
            };
            
            check.check = check;
            
            /**
             * Check is type of arg with name is equal to type
             *
             * @param name
             * @param arg
             * @param type
             */
            check.type  = function(name, arg, type) {
                var is = Util.type(arg) === type;
                
                if (!is)
                    throw(Error(name + ' should be ' + type));
                
                return check;
            };
            
            return check;
        }
        
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
        
        this.json               = new JsonProto();
        
        function JsonProto() {
            /**
             * @param str
             */
            this.parse      = function(str) {
                var obj;
                
                Util.exec.try(function() {
                    obj = JSON.parse(str);
                });
                
                return obj;
            },
            
            /**
             * @param obj
             */
            this.stringify  = function(obj) {
                var str;
                
                Util.exec.try(function() {
                    str = JSON.stringify(obj, null, 4);
                });
                
                return str;
            };
        }
        
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
        
        /**
         * function render template with view and own symbols
         *
         * @param templ
         * @param view
         */
        this.render = function(templ, view) {
            var result  = templ;
            
            Object
                .keys(view)
                .forEach(function(param) {
                    var str     = view[param],
                        regExp  = RegExp('{{\\s' + param + '\\s}}', 'g');
                    
                    result  = result.replace(regExp, str);
                });
            
            if (~result.indexOf('{{'))
                result = result.replace(/{{.*?}}/g, '');
            
            return result;
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
        
        this.exec                       = new ExecProto();
        
        function ExecProto() {
            /**
             * function do save exec of function
             * @param callback
             * @param arg1
             * ...
             * @param argN
             */
            var exec        = function(callback) {
                var ret,
                    isFunc  = Util.type.function(callback),
                    args    = [].slice.call(arguments, 1);
               
                if (isFunc)
                    ret     = callback.apply(null, args);
                
                return ret;
            };
            
            /*
             * return function that calls callback with arguments
             */
            
            exec.with           =  function(callback) {
                var result,
                    bind        = Function.bind;
                
                arguments[0]    = null;
                result          = bind.apply(callback, arguments);
                
                return result;
            };
             
             /**
             * return save exec function
             * @param callback
             */
            exec.ret        = function() {
                var result,
                    args        = [].slice.call(arguments);
                
                args.unshift(exec);
                result          = exec.with.apply(null, args);
                
                return result;
            };
            
            /**
             * function do conditional save exec of function
             * @param condition
             * @param callback
             * @param func
             */
            exec.if         = function(condition, callback, func) {
                var ret;
                
                if (condition)
                    exec(callback);
                else
                    exec(func, callback);
                
                return ret;
            };
            
            /**
             * exec function if it exist in object
             *
             * @param obj
             * @param name
             * @param arg
             */
            exec.ifExist                = function(obj, name, arg) {
                var ret,
                    func    = obj && obj[name];
                
                if (func)
                    func    = func.apply(obj, arg);
                
                return ret;
            };
            
            exec.parallel   = function(funcs, callback) {
                var keys        = [],
                    callbackWas = false,
                    arr         = [],
                    obj         = {},
                    count       = 0,
                    countFuncs  = 0,
                    type        = Util.type(funcs);
                
                Util.check(arguments, ['funcs', 'callback']);
                
                switch(type) {
                case 'array':
                    countFuncs  = funcs.length;
                    
                    funcs.forEach(function(func, num) {
                        exec(func, function() {
                            checkFunc(num, arguments, arr);
                        });
                    });
                    break;
                
                case 'object':
                    keys        = Object.keys(funcs);
                    countFuncs  = keys.length;
                    
                    keys.forEach(function(name) {
                        var func    = funcs[name];
                        
                        exec(func, function() {
                            checkFunc(name, arguments, obj);
                        });
                    });
                    break;
                }
                
                function checkFunc(num, data, all) {
                    var args    = [].slice.call(data, 1),
                        isLast  = false,
                        error   = data[0],
                        length  = args.length;
                    
                    ++count;
                    
                    isLast = count === countFuncs;
                    
                    if (!error)
                        if (length >= 2)
                            all[num] = args;
                        else
                            all[num] = args[0];
                    
                    if (!callbackWas && (error || isLast)) {
                        callbackWas = true;
                        
                        if (type === 'array')
                            callback.apply(null, [error].concat(all));
                        else
                            callback(error, all);
                    }
                }
            };
            
            /**
             * load functions thrue callbacks one-by-one
             * @param funcs {Array} - array of functions
             */
            exec.series             = function(funcs) {
                var func, callback,
                    isArray     = Util.type.array(funcs);
                
                if (isArray) {
                    func        = funcs.shift();
                    
                    callback    = function() {
                        return exec.series(funcs);
                    };
                    
                    exec(func, callback);
                }
            };
            
           /**
             * function execute param function in
             * try...catch block
             *
             * @param callback
             */
            exec.try                = function(callback) {
                var ret;
                try {
                    ret = callback();
                } catch(error) {
                    ret = error;
                }
                
                return ret;
            };
            
            return exec;
        }
        
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
                throw(Error('arr should be array!'));
            
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
                throw(Error('array should be array!'));
                
            if (typeof name !== 'string')
                throw(Error('name should be string!'));
            
            array.some(function(item) {
                var is = item.name === name,
                    isArray = Util.type.array(item);
                
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
    }
    
})(this);
