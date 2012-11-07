/* Module contain additional system functional */
var Util, exports;

(function(){
    "use strict";

    Util = exports || {};
    
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
     * function execute param function in
     * try...catch block
     * 
     * @param pCallBack
     */
    Util.tryCatch = function(pCallBack){
        var lRet;
        try{
            pCallBack();        
        }
        catch(pError){
            lRet = pError;
        }
        
        return lRet;
    };
    
    /**
     * function do save exec
     */
    Util.exec = function(pCallBack){
        var lRet = false;
        
        if( Util.isFunction(pCallBack) )
            lRet = pCallBack();
        else
            console.log('error in ' + pCallBack);
        
        return lRet;
    };
})();