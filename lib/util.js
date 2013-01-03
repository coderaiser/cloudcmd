/* 
 * Licensed under MIT License http://www.opensource.org/licenses/mit-license
 * Module contain additional system functional
 */
var Util, exports;
Util = exports || {};

(function(Util){
    "use strict";

    var Scope = exports ? global : window;
    
    /** setting function context
     * @param {function} pFunction
     * @param {object} pContext
     */
    Util.bind                   = function(pFunction, pContext){
        var lRet = false;
        
        if( Util.isFunction(pFunction) )
            lRet = pFunction.bind(pContext);
        
        return lRet;
    };
    
   Util.breakpoint              = function(){
        var lRet = Util.tryCatch(function(){
            debugger;
        });
        
        Util.log(lRet);
        
        return lRet;
    };
    
    /**
     * Функция ищет в имени файла расширение
     * и если находит возвращает true
     * @param pName - получает имя файла
     * @param pExt - расширение
     */
    Util.checkExtension                = function(pName, pExt){
        var lRet = false,
            lLength = pName.length; /* длина имени*/
        /* если длина имени больше
         * длинны расширения - 
         * имеет смысл продолжать
         */
        if (typeof pExt === 'string' && pName.length > pExt.length) {
            var lExtNum = pName.lastIndexOf(pExt),  /* последнее вхождение расширения*/
                lExtSub = lLength - lExtNum;        /* длина расширения*/
                
            /* если pExt - расширение pName */
            lRet = lExtSub === pExt.length;
        
        }else if(typeof pExt === 'object' && pExt.length){
            for(var i=0; i < pName.length; i++){
                lRet = Util.checkExtension(pName, pExt[i]);
                
                if(lRet)
                    break;
            }
        }
        
        return lRet;
    };
    
    /* STRINGS */
    /**
     * function check is strings are equal
     * @param pStr1
     * @param pStr2
     */
    Util.strCmp                 = function (pStr1, pStr2){
        return  this.isContainStr(pStr1, pStr2) &&
            pStr1.length === pStr2.length;
    };
    
    /**
     * function returns is pStr1 contains pStr2
     * @param pStr1
     * @param pStr2
     */
     
    Util.isContainStr           = function(pStr1, pStr2){
        return  pStr1                &&
                pStr2                && 
                pStr1.indexOf(pStr2) >= 0;
    };
    
    /**
     * function log pArg if it's not empty
     * @param pArg
     */
    Util.log                    = function(pArg){
        var lRet        = pArg,
            lConsole    = Scope.console;
        
        if(lConsole && pArg)
            lConsole.log(pArg);
        
        return lRet;
    };
    
    /**
     * load functions thrue callbacks one-by-one
     * @param pFunc_a {Array} - array of functions
     * @param pData - not necessarily
     */
    Util.loadOnLoad             = function(pFunc_a, pData){
        if( Util.isArray(pFunc_a) && pFunc_a.length) {
            var lFunc_a     = pFunc_a.slice(),
                lFunc       = lFunc_a.pop(),
                lCallBack   = function(pData){
                    return Util.loadOnLoad(lFunc_a, pData);
                };
            
            if( !Util.isUndefined(pData) )
                pData = {
                    data        : pData,
                    callback    : lCallBack
                };
            
            Util.exec(lFunc , pData || lCallBack);
        }
    };
    
    /**
     * function remove substring from string
     * @param pStr
     * @param pSubStr
     */
    Util.removeStr              = function(pStr, pSubStr){
        return pStr.replace(pSubStr,'');
    };
        
    /**
     * invoke a couple of functions in paralel
     * 
     * @param {Array} pFuncs
     * @param {function} pCallback
     * 
     * Example:
     * i >=0, pFuncs[i] = function(param, callback){}
     */
    Util.paralelExec            = function(pFuncs, pCallback){
        var done = [];
        
        /* add items to array done*/
        function addFunc(pNum){
            done.push(pNum);
        }
        
        /* 
         * improve callback of funcs so
         * we pop number of function and
         * if it's last we call pCallBack
         */
        function doneFunc(pParams){
            Util.exec(pParams.callback);
            
            var lNum = done.pop (pParams.number);
            if(!lNum){
                Util.exec(pCallback);
            }
        }
        
        for(var i = 0, n = pFuncs.length; i < n; i++){
            addFunc(i);
            
            var lFunc = pFuncs[i].callback;
            
            pFuncs[i].callback = Util.retExec(doneFunc, {
                number      : i,
                callback    : lFunc
            });
        }
    };
    
    /**
     * functions check is pVarible is array
     * @param pVarible
     */
    Util.isArray                = function(pVarible){
        return pVarible instanceof Array;
    };
    
    /**
     * functions check is pVarible is boolean
     * @param pVarible
     */
    Util.isBoolean               = function(pVarible){
        return Util.isType(pVarible, 'boolean');
    };
    
    /**
     * functions check is pVarible is function
     * @param pVarible
     */
    Util.isFunction             = function(pVarible){
        return Util.isType(pVarible, 'function');
    };
    
    /**
     * functions check is pVarible is object
     * @param pVarible
     */
    Util.isObject               = function(pVarible){
        return Util.isType(pVarible, 'object');
    };
    
    /**
     * functions check is pVarible is string
     * @param pVarible
     */
     Util.isString               = function(pVarible){
        return Util.isType(pVarible, 'string');
    };
    
    /**
     * functions check is pVarible is string
     * @param pVarible
     */
     Util.isUndefined           = function(pVarible){
        return Util.isType(pVarible, 'undefined');
    };
    
    /**
     * functions check is pVarible is pType
     * @param pVarible
     * @param pType
     */    
    Util.isType                 = function(pVarible, pType){
        return typeof pVarible === pType;
    };
    
    
   /**
     * return save exec function
     * @param pCallBack
     * @param pArg
     */
    Util.retExec                = function(pCallBack, pArg){
        return function(pArgument){
            if( !Util.isUndefined(pArg) )
                pArgument = pArg;
            Util.exec(pCallBack, pArgument);
        };
    };
   
   /**
     * return function wich exec function in params
     * @param pCallBack
     * @param pArg
     */
    Util.retFunc                = function(pCallBack, pArg){
        return function(){
            return Util.exec(pCallBack, pArg);
        };
    };
    /**
     * function return false
     */
    Util.retFalse               = function(){
        var lRet = false;
        
        return lRet;
    };
    
    /**
     * return load functions thrue callbacks one-by-one
     * @param pFunc_a {Array} - array of functions
     * @param pData - not necessarily
     */
    Util.retLoadOnLoad             = function(pFunc_a, pData){
        return function(){
            Util.loadOnLoad(pFunc_a, pData);
        };
    };
    
    /**
     * set value to property of object, if object exist
     * @param pArgs {object, property, value}
     */
    Util.setValue               = function(pArgs){
        var lRet = false;
        
        if( Util.isObject(pArgs) ){
            var lObj    = pArgs.object,
                lProp   = pArgs.property,
                lVal    = pArgs.lVal;
            
            if(lObj){
                lObj[lProp] = lVal;
                lRet = true;
            }
        }
        
        return lRet;
    };
    
    /**
     * set timout before callback would be called
     * @param pArgs {func, callback, time}
     */    
    Util.setTimeout             = function(pArgs){
        var lDone,
            lFunc       = pArgs.func,
            lTime       = pArgs.time || 1000,
            lCallBack   = function(pArgument){
                if(!lDone){
                    lDone = Util.exec(pArgs.callback, pArgument);
                }
            };
        
        var lTimeoutFunc = function(){
            setTimeout(function(){
                Util.exec(lFunc, lCallBack);
                if(!lDone)
                    lTimeoutFunc();
            }, lTime);
        };
        
        lTimeoutFunc();
    };
    
    
    /**
     * function execute param function in
     * try...catch block
     * 
     * @param pCallBack
     */
    Util.tryCatch               = function(pCallBack){
        var lRet;
        try{
            lRet = pCallBack();
        }
        catch(pError){
            lRet = pError;
        }
        
        return lRet;
    };
    
    /**
     * function execute param function in
     * try...catch block and log result
     * 
     * @param pTryFunc
     */
    Util.tryCatchDebug          = function(pTryFunc){
        var lRet = Util.tryCatch(pTryFunc);
        
        if(lRet)
            Util.debug();
        
        return lRet;
    };
    
    /**
     * function execute param function in
     * try...catch block and log result
     * 
     * @param pTryFunc
     */
    Util.tryCatchLog                = function(pTryFunc){
        var lRet;
        
        lRet = Util.tryCatch(pTryFunc);
        
        return Util.log(lRet);
    };
    
    /**
     * function execute param function in
     * try...catch block and log result
     * 
     * @param pCallBack
     */
    Util.tryCatchCall               = function(pTryFunc, pCallBack){
        var lRet;
        
        lRet = Util.tryCatch(pTryFunc);
        
        if(lRet)
            Util.exec(pCallBack, lRet);
        
        return lRet;
    };
    
    /**
     * function do save exec of function
     * @param pCallBack
     * @param pArg
     */
    Util.exec                       = function(pCallBack, pArg){
        var lRet = false;
        
        if(pCallBack){
            if( Util.isFunction(pCallBack) )
                lRet = pCallBack(pArg);
            else {
                var lCallBack = pCallBack.callback || pCallBack.success;
                lRet = Util.exec(lCallBack, pArg);
            }
        }
        
        return lRet;
    };
    
    /** 
     * Gets current time in format hh:mm:ss
     */
    Util.getTime                    = function(){
        var lRet,
            date        = new Date(),
            hours       = date.getHours(),
            minutes     = date.getMinutes(),
            seconds     = date.getSeconds();
            
        minutes         = minutes < 10 ? '0' + minutes : minutes;
        seconds         = seconds < 10 ? '0' + seconds : seconds;
        
        lRet            = hours + ":" + minutes + ":" + seconds;
        
        return lRet;
    };
    /** 
     * Gets current date in format yy.mm.dd hh:mm:ss
     */
    Util.getDate                    = function(){
        var date    = new Date(),
            day     = date.getDate(),
            month   = date.getMonth() + 1,
            year    = date.getFullYear(),
            lRet    = year + "-" + month + "-" + day + " " + Util.getTime();
        
        return lRet;
    };
    
})(Util, exports);