/* 
 * Licensed under MIT License http://www.opensource.org/licenses/mit-license
 * Module contain additional system functional
 */
var Util, exports;

(function(){
    "use strict";

    Util = exports || {};
    
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
    
    
    /* STRINGS */
    /**
     * function check is strings are equal
     * @param pStr1
     * @param pStr2
     */
    Util.strCmp                 = function (pStr1, pStr2){
        return  this.isContainStr(pStr1, pStr2) &&
                pStr1.length == pStr2.length;
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
        var lRet = pArg;
        if(pArg)
            console.log(pArg);
        
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
            
            if(pData)
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
     * functions check is pVarible is function
     * @param pVarible
     */
    Util.isFunction             = function(pVarible){
        return Util.isType(pVarible, 'function');
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
        return function(){
            Util.exec(pCallBack, pArg);
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
     * @param pCallBack
     */
    Util.tryCatchLog                = function(pCallBack){
        var lRet;
        
        lRet = Util.tryCatch(pCallBack);
        
        return Util.log(lRet);
    };
    /**
     * function do save exec of function
     * @param pCallBack
     * @param pArg
     */
    Util.exec = function(pCallBack, pArg){
        var lRet = false;
        
        if( Util.isFunction(pCallBack) )
            lRet = pCallBack(pArg);
        
        return lRet;
    };
    
    /** 
     * Gets current time in format hh:mm:ss
     */
    Util.getTime = function(){
        var date        = new Date(),
            hours       = date.getHours(),
            minutes     = date.getMinutes(),
            seconds     = date.getSeconds();
            
        minutes         = minutes < 10 ? '0' + minutes : minutes;
        seconds         = seconds < 10 ? '0' + seconds : seconds;
        
        return hours + ":" + minutes + ":" + seconds;
    };
})();