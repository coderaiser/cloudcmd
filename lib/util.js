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
    
    Util.ExecOnExec             = function(pCallBacks){
        if(Util.isArray(pCallBacks)){
            for(var i = 0, n = pCallBacks.length; i < n; i++){
                var lFunc =  pCallBacks.pop();
                
                Util.execOnExec( Util.retExec(lFunc, pCallBacks) );
            }
        }
    };
    
    /**
     * function execute param function in
     * try...catch block
     * 
     * @param pCallBack
     */
    Util.tryCatch = function(pCallBack){
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
     * function do save exec
     */
    Util.exec = function(pCallBack, pArg){
        var lRet = false;
        
        if( Util.isFunction(pCallBack) )
            lRet = pCallBack(pArg);
        
        return lRet;
    };
    
     /** 
     * function gets time
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