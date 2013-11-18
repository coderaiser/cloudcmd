/*
 * Licensed under MIT License http://www.opensource.org/licenses/mit-license
 * Module contain additional system functional
 */
var Util, exports;
Util = exports || {};

(function(Util) {
    'use strict';
    
    var Scope = exports ? global : window;
    
    Util.asyncCall              = function(pFuncs, pOnLoad, pContext) {
        var i, element, name, func,
            funcsCount  = pFuncs.length,
            count       = 0,
            data        = [];
            
        for (i = 0; i < funcsCount; i++) {
            func = pFuncs[i];
            callCheckFunc(i, func);
        }
        
        function checkFunc(pNum, pData) {
            var i, m    = pData.length,
                params  = [];
            
            ++count;
            
            if (m >= 2) {
                for (i = 0; i < m; i++)
                    params[i] = pData[i];
                
                data[pNum] = params;
            } else
                data[pNum] = pData[0];
            
            if (count === funcsCount)
                pOnLoad.apply(pContext, data);
        }
        
        function callCheckFunc(pNum, pFunc) {
            Util.exec(pFunc, function() {
                checkFunc(pNum, arguments);
            });
        }
    },
    
    /**
     * ad new line (if it's not)
     * @param {string} pText
     */
    Util.addNewLine             = function(pText){
        var lNewLine    = '',
            n           = pText && pText.length;
        
        if(n && pText[n-1] !== '\n')
            lNewLine = '\n';
        
        return pText + lNewLine;
    };
    
    /**
     * rm new line (if it's)
     * @param {string} pText
     */
    Util.rmNewLine             = function(pText){
        var n           = pText && pText.length - 1,
            char        = pText[n];
        
        if (n && char === '\n' || char === '\r')
            pText = pText.substr(pText, n);
        
        return pText;
    };
    
    /** setting function context
     * @param {function} pFunction
     * @param {object} pContext
     */
    Util.bind                   = function(pFunction, pContext) {
        var lRet;
        
        if (Util.isFunction(pFunction))
            lRet = pFunction.bind(pContext);
        
        return lRet;
    };
    
    /**
     * callback for functions(pError, pData)
     * thet moves on our parameters.
     * 
     * @param pFunc
     * @param pParams
     */
    Util.call                   = function(pFunc, pParams) {
        function lFunc(pError, pData) {
            Util.exec(pFunc, {
                error   : pError,
                data    : pData,
                params  : pParams
            });
        }
        
        return lFunc;
    };
    
    /**
     * Функция ищет в имени файла расширение
     * и если находит возвращает true
     * @param pName - получает имя файла
     * @param pExt - расширение
     */
    Util.checkExtension         = function(pName, pExt) {
        var i, lExtNum, lExtSub,
            lRet = false,
            lLength = pName.length; /* длина имени*/
        
        /* если длина имени больше длинны расширения - имеет смысл продолжать
         */
        if (Util.isString(pExt) && pName.length > pExt.length) {
            lExtNum = pName.lastIndexOf(pExt),  /* последнее вхождение расширения*/
            lExtSub = lLength - lExtNum;        /* длина расширения*/
            
            /* если pExt - расширение pName */
            lRet = lExtSub === pExt.length;
        
        } else if (Util.isObject(pExt) && pExt.length)
            for(i = 0; i < pName.length; i++) {
                lRet = Util.checkExtension(pName, pExt[i]);
                
                if (lRet)
                    break;
            }
        
        return lRet;
    };
    
    
    /**
     * Check is Properties exists and they are true if neaded
     * 
     * @param pObj
     * @param pPropArr
     * @param pTrueArr
     */
    Util.checkObj               = function(pObj, pPropArr, pTrueArr) {
        var lRet,
            i, n;
        
        if (pObj) {
            lRet = Util.isArray(pPropArr);
            if (lRet) {
                n = pPropArr.length;
                for (i = 0; i < n; i++) {
                    var lProp = pPropArr[i];
                    lRet = pObj.hasOwnProperty( lProp );
                    if (!lRet) {
                        console.trace();
                        Util.logError(lProp + '  not in Obj!');
                        Util.log(pObj);
                        break;
                    }
                }
            }
            
            if (lRet && Util.isArray(pTrueArr))
                lRet = Util.checkObjTrue(pObj, pTrueArr);
        }
        
        return lRet;
    };
    
    /**
     * Check is Properties exists and they are true 
     * 
     * @param pObj
     * @param pPropArr
     * @param pTrueArr
     */
    Util.checkObjTrue           = function(pObj, pTrueArr) {
        var lRet, lTrueArr,
            i, n;
        if (pObj) {
            lTrueArr = Util.isArray(pTrueArr) ? pTrueArr : [pTrueArr];
            
            n = lTrueArr.length;
            for(i = 0; i < n; i++) {
                var lProp   = lTrueArr[i];
                lRet        = pObj[lProp];
                
                if (!lRet) {
                    console.trace();
                    Util.logError(lProp + '  not true!');
                    Util.log(pObj);
                    break;
                }
            }
        }
        
        return lRet;
    };
    
    /**
     * Copy properties array pProps from pFromObj to pToObj
     * 
     * @param pFromObj
     * @param pToObj
     * @param pProps
     */
    Util.copyObj                = function(pFromObj, pToObj, pProps) {
        var lRet        = pToObj || pProps || {},
            
            forIn       = function(obj) {
                Util.forIn(obj, function(name) {
                    pToObj[name]    = obj[name];
                });
            };
        
        if (Util.isObject(pFromObj)) {
            if (pProps)
                forIn(pProps);
            
            forIn(pFromObj);
        }
        
        return lRet;
    };
    
    Util.convertArrToObj        = function(pArrKeys, pArrVal) {
        var i, n, lName, lRet;
        
        if (pArrKeys && pArrVal) {
            for(i = 0, n = pArrKeys; i < n; i++) {
                lName       = pArrKeys[i];
                lRet[lName] = pArrVal[i];
            }
        }
        
        return lRet;
    };
    
    /**
     * copy pObj properties to pTargetObject
     * 
     * @pTarget
     * @pObj
     */
    Util.extend                 = function(pTarget, PObj) {
        var i, n, lObj, lRet = Util.isObject(pTarget) ? pTarget : {};
        
        if ( Util.isArray(PObj) )
            for(i = 0, n = PObj.length; i < n; i++)
                lRet = Util.extend(pTarget, PObj[i]);
        
        else if (PObj) {
            lObj = Util.isFunction(PObj)  ? new PObj() : PObj;
            
            for(i in lObj)
                lRet[i] = lObj[i];
        }
        
        return lRet;
    };
    
    /**
     * copy pObj properties to pTargetObject
     * 
     * @pTarget
     * @pObj
     */
     Util.extendProto           = function(pObj) {
        var lRet, F     = function() {};
        F.prototype     = Util.extend({}, pObj);
        lRet = new F();
        
        return lRet;
     };
    
    /** for function
     *  @param pI
     *  @param pN
     *  @param pFunc
     */
    Util.for                    = function(pI, pN, pFunc) {
        if (Util.isFunction(pFunc))
            for(var i = pI, n = pN; i < n; i++) {
                if (pFunc(i))
                    break;
            }
    };
    
     /** for in function
     *  @param pObj
     *  @param pFunc
     */
    Util.forIn                    = function(pObj, pFunc) {
        if (Util.isFunction(pFunc))
            for(var lName in pObj)
                if (pFunc(lName))
                    break;
    };
    
    /** for function with i = 0
     *  @param pN
     *  @param pFunc
     */
    Util.fori                   = function(pN, pFunc) {
        var lRet = Util.for(0, pN, pFunc);
        
        return lRet;
    };
    
    /**
     * @param pJSON
     */    
    Util.parseJSON               = function(pJSON) {
        var lRet;
        
        Util.tryCatch(function() {
            lRet = JSON.parse(pJSON);
        });
        
        return lRet;
    };
    
    /**
     * @param pObj
     */
    Util.stringifyJSON           = function(pObj) {
        var lRet;
        
        Util.tryCatchLog(function() {
            lRet = JSON.stringify(pObj, null, 4);
        });
        
        return lRet;
    };
    
    /**
     * function check is strings are equal
     * @param pStr1
     * @param pStr2
     */
    Util.strCmp                 = function(pStr1, pStr2) {
        var lRet = Util.isString(pStr1);
        
        if (lRet) {
            if ( Util.isArray(pStr2) )
                for(var i = 0, n = pStr2.length; i < n; i++) {
                    lRet = Util.strCmp( pStr1, pStr2[i] );
                    
                    if (lRet)
                        break;
                }
            else if ( Util.isString(pStr2) )
                lRet =  Util.isContainStr(pStr1, pStr2) &&
                    pStr1.length === pStr2.length;
        }
        
        return lRet;
        
    };
    
    Util.getStrBigFirst         = function(pStr) {
        var lRet;
        
        if (Util.isString(pStr) && pStr.length > 0)
            lRet =  pStr[0].toUpperCase() + 
                    pStr.substring(1);
        else
            lRet = pStr;
        
        return lRet;
    };
    
    /**
     * function returns is pStr1 contains pStr2
     * @param pStr1
     * @param pStr2
     */
     
    Util.isContainStr           = function(pStr1, pStr2) {
        var lRet = Util.isString(pStr1);
        
        if ( lRet ) {
            if ( Util.isArray(pStr2) )
                 for(var i = 0, n = pStr2.length; i < n; i++) {
                     lRet = Util.isContainStr( pStr1, pStr2[i] );
                    
                    if (lRet)
                        break;
                 }
            else if ( Util.isString(pStr2) )
                lRet = pStr1.indexOf(pStr2) >= 0;
        }
        
        return lRet;
    };
    
    /**
     * is pStr1 contains pStr2 at begin
     * @param pStr1
     * @param pStr2
     */
    Util.isContainStrAtBegin    = function(pStr1, pStr2) {
        var i, n, length, subStr, lRet;
        
        if (Util.isString(pStr1))
             if (Util.isArray(pStr2)) {
                 n = pStr2.length;
                 
                 for(i = 0; i < n; i++) {
                    lRet = Util.isContainStrAtBegin(pStr1, pStr2[i]);
                    
                    if (lRet)
                        break;
                 }
             } else {
                length = pStr2.length,
                subStr = pStr1.substring(0, length);
                
                lRet = subStr === pStr2;
            }
            
        return lRet;
    };
    
    /**
     * function log pArg if it's not empty
     * @param pArg
     */
    Util.log                    = function() {
        var lArg        = arguments,
            lConsole    = Scope.console,
            lDate       = '[' + Util.getDate() + '] ',
            
            lUnShift    = Util.bind([].unshift, lArg),
            lShift      = Util.bind([].shift, lArg),
            lJoin       = Util.bind([].join, lArg);
        
        if (lConsole && lArg.length && lArg[0]) {
            lUnShift(lDate);
            lConsole.log.apply(lConsole, lArg);
            lShift();
        }
        
        return lJoin(' ');
    };
    
    /**
     * log array of elements
     * @param pArray
     */
    Util.logArray               = function(pArray) {
        var i, n;
        
        if (pArray)
            for (i = 0, n = pArray.length; i < n; i++)
                Util.log( pArray[i] );
        
        return pArray;
    };
    
    /**
     * function log pArg if it's not empty
     * @param pArg
     */
    Util.logError               = function(pArg) {
        var lConsole    = Scope.console,
            lDate       = '[' + Util.getDate() + '] ';
        
        if (lConsole && pArg) {
            var lMsg = pArg.message;
            if ( lMsg )
                lDate += pArg.message + ' ';
            
            lConsole.error(lDate, pArg);
        }
        
        return pArg;
    };
    
    /**
     * load functions thrue callbacks one-by-one
     * @param pFunc_a {Array} - array of functions
     * @param pData - not necessarily
     */
    Util.loadOnLoad             = function(pFunc_a, pData) {
        if ( Util.isArray(pFunc_a) && pFunc_a.length) {
            var lFunc_a     = pFunc_a.slice(),
                lFunc       = lFunc_a.pop(),
                lCallBack   = function(pData) {
                    return Util.loadOnLoad(lFunc_a, pData);
                };
            
            if ( !Util.isUndefined(pData) )
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
    Util.removeStr              = function(pStr, pSubStr) {
        var lRet = Util.isString(pStr) && pSubStr;
        
        if ( lRet ) {
            var n = pSubStr.length;
            
            if ( Util.isArray(pSubStr) )
                Util.fori(n, function(i) {
                    lRet = pStr =  Util.replaceStr(pStr, pSubStr[i], '');
                });
            else
                lRet = Util.replaceStr(pStr, pSubStr, '');
        }
        else
            lRet = pStr;
        
        return lRet;
    };
    
      /**
     * function remove substring from string one time
     * @param pStr
     * @param pSubStr
     */
    Util.removeStrOneTime            = function(pStr, pSubStr) {
        var lRet = Util.isString(pStr) && pSubStr;
        
        if ( lRet ) {
            var n = pSubStr.length;
            
            if ( Util.isArray(pSubStr) )
                Util.fori(n, function(i) {
                    lRet = pStr = pStr.replace(pSubStr[i], '');
                });
            else
                lRet = pStr.replace(pSubStr, '');
        }
        else
            lRet = pStr;
        
        return lRet;
    };
    
    /**
     * function replase pFrom to pTo in pStr
     * @pStr
     * @pFrom
     * @pTo
     * @pNotEscape
     */
    Util.replaceStr             = function(pStr, pFrom, pTo, pNotEscape) {
        var lRet = pStr;
        
        if (pStr && pFrom) {
            if (!pNotEscape)
                pFrom = Util.escapeRegExp(pFrom);
            
            lRet = pStr.replace(new RegExp(pFrom, 'g'), pTo);
        }
       
       return lRet;
    };
    
    
    Util.escapeRegExp = function(pStr) {
        var lRet = pStr;
        
        if ( Util.isString(pStr) )
            lRet = pStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        
        return lRet;
    };
    
    /**
     * function render template with view
     * @pTempl
     * @pView
     */
    Util.render                  = function(pTempl, pView) {
        var lRet = Util.ownRender(pTempl, pView);
                
        return lRet;
    };
    
    /**
     * function render template with view and own symbols
     * @pTempl
     * @pView
     * @pSymbols
     */
    Util.ownRender                  = function(pTempl, pView, pSymbols) {
        var SPACES  = '\\s*';
        
        if (!pSymbols)
            pSymbols = ['{{' + SPACES, SPACES + '}}'];
        
        var lRet    = pTempl,
            lFirstChar,
            lSecondChar;
            
            lFirstChar  = pSymbols[0];
            lSecondChar = pSymbols[1]  || lFirstChar;
        
        for(var lVar in pView) {
            var lStr = pView[lVar];
            lStr = Util.exec(lStr) || lStr;
            
            lRet = Util.replaceStr(lRet, lFirstChar + lVar + lSecondChar, lStr, true);
        }
        
        return lRet;
    };
    
    
    /**
     * invoke a couple of functions in paralel
     * 
     * @param {Array} pFuncs
     * @param {function} pCallback
     * 
     * Example:
     * i >=0, pFuncs[i] = function(param, callback) {}
     */
    Util.paralelExec            = function(pFuncs, pCallback) {
        var done = [];
        
        /* add items to array done*/
        function addFunc(pNum) {
            done.push(pNum);
        }
        
        /* 
         * improve callback of funcs so
         * we pop number of function and
         * if it's last we call pCallBack
         */
        function doneFunc(pParams) {
            Util.exec(pParams.callback);
            
            var lNum = done.pop (pParams.number);
            if (!lNum) {
                Util.exec(pCallback);
            }
        }
        
        for(var i = 0, n = pFuncs.length; i < n; i++) {
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
    Util.isArray                = function(pVarible) {
        return pVarible instanceof Array;
    };
    
    /**
     * functions check is pVarible is ArrayBuffer
     * @param pVarible
     */
    Util.isArrayBuffer          = function(pVarible) {
        return pVarible instanceof ArrayBuffer;
    };
    
    /**
     * functions check is pVarible is boolean
     * @param pVarible
     */
    Util.isBoolean               = function(pVarible) {
        return Util.isType(pVarible, 'boolean');
    };
    
    /**
     * functions check is pVarible is function
     * @param pVarible
     */
    Util.isFunction             = function(pVarible) {
        return Util.isType(pVarible, 'function');
    };
    
    /**
     * functions check is pVarible is number
     * @param pVarible
     */
    Util.isNumber               = function(pVarible) {
        return Util.isType(pVarible, 'number');
    };
    
    /**
     * functions check is pVarible is object
     * @param pVarible
     */
    Util.isObject               = function(pVarible) {
        return Util.isType(pVarible, 'object');
    };
    
    /**
     * functions check is pVarible is string
     * @param pVarible
     */
     Util.isString               = function(pVarible) {
        return Util.isType(pVarible, 'string');
    };
    
    /**
     * functions check is pVarible is string
     * @param pVarible
     */
     Util.isUndefined           = function(pVarible) {
        return Util.isType(pVarible, 'undefined');
    };
    
    /**
     * functions check is pVarible is pType
     * @param pVarible
     * @param pType
     */    
    Util.isType                 = function(pVarible, pType) {
        return typeof pVarible === pType;
    };
    
    
   /**
     * return save exec function
     * @param pCallBack
     * @param pArg
     */
    Util.retExec                = function() {
        var args        = arguments;
        
        return function() {
            var argsLocal, callback,
                n   = args.length;
            
            if (n > 1)
                argsLocal   = args;
            else {
                callback    = args[0];
                argsLocal   = arguments;
                [].unshift.call(argsLocal, callback);
            }
            
            Util.exec.apply(null, argsLocal);
        };
    };
   
   /**
     * return function wich exec function in params
     * @param arguments: callback, args
     */
    Util.retFunc                = function() {
        var args = arguments;
        
        return function() {
            return Util.exec.apply(null, args);
        };
    };
    
    /**
     * function return false
     */
    Util.retFalse               = function() {
        var lRet = false;
        
        return lRet;
    };
    
    /**
     * function return param
     */
    Util.retParam               = function(pParam) {
        return pParam;
    };
    
    /**
     * return load functions thrue callbacks one-by-one
     * @param pFunc_a {Array} - array of functions
     * @param pData - not necessarily
     */
    Util.retLoadOnLoad             = function(pFunc_a, pData) {
        return function() {
            Util.loadOnLoad(pFunc_a, pData);
        };
    };
    
    /**
     * set value to property of object, if object exist
     * @param pArgs {object, property, value}
     */
    Util.setValue               = function(pArgs) {
        var lRet = false;
        
        if ( Util.isObject(pArgs) ) {
            var lObj    = pArgs.object,
                lProp   = pArgs.property,
                lVal    = pArgs.lVal;
            
            if (lObj) {
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
    Util.setTimeout             = function(pArgs) {
        var lDone,
            lFunc       = pArgs.func,
            lTime       = pArgs.time || 1000,
            lCallBack   = function(pArgument) {
                if (!lDone) {
                    lDone = Util.exec(pArgs.callback, pArgument);
                }
            };
        
        var lTimeoutFunc = function() {
            setTimeout(function() {
                Util.exec(lFunc, lCallBack);
                if (!lDone)
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
    Util.tryCatch               = function(pCallBack) {
        var lRet;
        try{
            lRet = pCallBack();
        }
        catch(pError) {
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
    Util.tryCatchDebug          = function(pTryFunc) {
        var lRet = Util.tryCatch(pTryFunc);
        
        if (lRet)
            Util.debug();
        
        return lRet;
    };
    
    /**
     * function execute param function in
     * try...catch block and log result
     * 
     * @param pTryFunc
     */
    Util.tryCatchLog                = function(pTryFunc) {
        var lRet;
        
        lRet = Util.tryCatch(pTryFunc);
        
        return Util.logError(lRet);
    };
    
    /**
     * function execute param function in
     * try...catch block and log result
     * 
     * @param pCallBack
     */
    Util.tryCatchCall               = function(pTryFunc, pCallBack) {
        var lRet;
        
        lRet = Util.tryCatch(pTryFunc);
        
        if (lRet)
            Util.exec(pCallBack, lRet);
        
        return lRet;
    };
    
    /**
     * function do save exec of function
     * @param pCallBack
     * @param pArg1
     * ...
     * @param pArgN
     */
    Util.exec                       = function(pCallBack) {
        var lRet, lCallBack;
        
       /* drop first element */
       [].shift.call(arguments);
        if (pCallBack) {
            if (Util.isFunction(pCallBack))
                lRet = pCallBack.apply(null, arguments);
            else {
                lCallBack   = pCallBack.callback || pCallBack.success;
                /* add first element */
                [].unshift.call(arguments, lCallBack);
                lRet        = Util.exec.apply(null, arguments);
            }
        }
        
        return lRet;
    };
    
    /**
     * exec function if it exist in object
     * @pArg
     */
    Util.execIfExist                = function(pObj, pName, pArg) {
        var lRet;
        
        if (pObj) {
            var lFunc = Util.bind(pObj[pName], pObj);
            lRet = Util.exec(lFunc, pArg);
        }
        
        return lRet;
    };
    
    /**
     * function do conditional save exec of function
     * @param pCondition
     * @param pCallBack
     * @param pFunc
     */
    Util.ifExec                       = function(pCondition, pCallBack, pFunc) {
        var lRet;
        
        if (pCondition)
            Util.exec(pCallBack, pCondition);
        else
            Util.exec(pFunc, pCallBack);
        
        return lRet;
    };
    
    /**
     * function gets file extension
     * @param pFileName
     * @return Ext
     */
    Util.getExtension               = function(pFileName) {
        var lRet, lDot;
        
        if ( Util.isString(pFileName) ) {
            lDot = pFileName.lastIndexOf('.');
            lRet = pFileName.substr(lDot);
        }
        
        return lRet;
    };
    
   /**
     * get values from Object Array name properties
     * or 
     * @pObj
     */
    Util.getNamesFromObjArray       = function(pArr) {
        var lRet = [];
        
        if (pArr && !Util.isArray(pArr))
            pArr = pArr.data;
        
        if (pArr)
            Util.fori(pArr.length, function(i) {
                lRet[i] = pArr[i].name || pArr[i];
            });
        
        return lRet;
    };
    
    /**
     * find object by name in arrray
     * or 
     * @pObj
     */
    Util.findObjByNameInArr         = function(pArr, pObjName) {
        var lRet;
        
        if (pArr) {
            for(var i = 0, n = pArr.length; i < n; i++ )
                if (pArr[i].name === pObjName) break;
            
            lRet = pArr[i].data;
        }
        
        return lRet;
    };
    
    /** 
     * Gets current time in format hh:mm:ss
     */
    Util.getTime                    = function() {
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
     * start timer
     * @pArg
     */
    Util.time                       = function(pArg) {
        var lRet,
            lConsole    = Scope.console;
        
        lRet = Util.execIfExist(lConsole, 'time', pArg);
        
        return lRet;
    };
    
    /**
     * stop timer
     * @pArg
     */
    Util.timeEnd                   = function(pArg) {
        var lRet,
            lConsole    = Scope.console;
        
        lRet = Util.execIfExist(lConsole, 'timeEnd', pArg);
        
        return lRet;
    };
    
    /** 
     * Gets current date in format yy.mm.dd hh:mm:ss
     */
    Util.getDate                    = function() {
        var date    = new Date(),
            day     = date.getDate(),
            month   = date.getMonth() + 1,
            year    = date.getFullYear(),
            lRet    = year + "-" + month + "-" + day + " " + Util.getTime();
        
        return lRet;
    };
    
})(Util, exports);
