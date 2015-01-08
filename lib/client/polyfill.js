var Util, DOM, jQuery;

(function(window, document, Util, DOM, $) {
    'use strict';
    
    var type = Util.type;
    
    if (!window.XMLHttpRequest || !document.head)
        DOM.load.ajax = $.ajax;
        
    /* setting head ie6 - ie8 */
    if (!document.head)
        document.head = $('head')[0];
    
    if (!Function.bind)
        Function.prototype.bind = function (context) {
            var aArgs   = [].slice.call(arguments, 1), 
                fToBind = this, 
                NOP     = function () {},
                fBound  = function () {
                    var arr     = [].slice.call(arguments),
                        args    = aArgs.concat(arr);
                    
                    return fToBind.apply(context, args);
                };
            
            NOP.prototype = this.prototype;
            fBound.prototype = new NOP();
            
            return fBound;
          };
    
    if (!Array.isArray)
        Array.isArray = function(arr) {
            return type(arr) === 'array';
        };
    
    /*
     * typeof callback === "function" should not be used,
     * as older browsers may report objects to be a function,
     * which they are not
     */
    Util.type.function = $.isFunction;
    
    if (!document.addEventListener)
        /**
         * safe add event listener on ie
         * @param pType
         * @param pListener
         */
        DOM.addListener = function(pType, pListener, pCapture, pElement) {
            var lRet;
            
            if (!pElement)
                pElement = window;
            
            lRet = $(pElement).bind(pType, null, pListener);
            
            return lRet;
        };
    
    if (!document.removeEventListener) {
        DOM.removeListener = function(pType, pListener, pCapture, pElement) {
            var lRet;
            
            if (!pElement)
                pElement = window;
            
            $(pElement).unbind(pType, pListener);
            
            return lRet;
        };
    }
    
    if (!document.getElementsByClassName) {
        DOM.getByClassAll = function(pClass, pElement) {
            var lClass = '.' + pClass,
                lResult;
            
            if (pElement)
                lResult = $(pElement).find(lClass);
            else
                lResult = $.find(lClass);
            
            return lResult;
        };
    }
    
    /* function polyfill webkit standart function
     *    https://gist.github.com/2581101
     */
    DOM.scrollIntoViewIfNeeded = function(element, centerIfNeeded) {
        var parent,
            topWidth,
            leftWidth,
            parentComputedStyle,
            parentBorderTopWidth,
            parentBorderLeftWidth,
            overTop,
            overBottom,
            overLeft,
            overRight,
            alignWithTop;
        
        if (window.getComputedStyle) {
            if (arguments.length === 1)
                centerIfNeeded = false;
            
            parent                  = element.parentNode;
            parentComputedStyle     = window.getComputedStyle(parent, null);
            
            topWidth                = parentComputedStyle.getPropertyValue('border-top-width');
            leftWidth               = parentComputedStyle.getPropertyValue('border-left-width');
            
            parentBorderTopWidth    = parseInt(topWidth, 10);
            parentBorderLeftWidth   = parseInt(leftWidth, 10);
                
            overTop                 = element.offsetTop - parent.offsetTop < parent.scrollTop,
            overBottom              = 
                (element.offsetTop         - 
                    parent.offsetTop        + 
                    element.clientHeight   -
                    parentBorderTopWidth)   >
                (parent.scrollTop + parent.clientHeight),
                
            overLeft                = element.offsetLeft - 
                parent.offsetLeft < parent.scrollLeft,
                
            overRight               =
                (element.offsetLeft        -
                    parent.offsetLeft       +
                    element.clientWidth    -
                    parentBorderLeftWidth)  >
                (parent.scrollLeft + parent.clientWidth),
            
            alignWithTop            = overTop && !overBottom;
            
            if ((overTop || overBottom) && centerIfNeeded)
                parent.scrollTop    =
                    element.offsetTop      -
                    parent.offsetTop        -
                    parent.clientHeight / 2 -
                    parentBorderTopWidth    +
                    element.clientHeight / 2;
            
            if ((overLeft || overRight) && centerIfNeeded)
                parent.scrollLeft   =
                    element.offsetLeft     -
                    parent.offsetLeft       -
                    parent.clientWidth / 2  -
                    parentBorderLeftWidth   +
                    element.clientWidth / 2;
            
            if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded)
                element.scrollIntoView(alignWithTop);
        }
    };
          
    if (!document.body.classList) {
        
        DOM.isContainClass          = function(pElement, pClass) {
            var lRet,
                lClassName  = pElement && pElement.className;
            
            if (lClassName)
                lRet = lClassName.indexOf(pClass) > 0;
                
            return lRet;
        };
        
        DOM.addClass = function(pElement, pClass) {
            var lRet,
                lClassName  = pElement && pElement.className,
                lSpaceChar  = lClassName ? ' ' : '';
            
            lRet = !DOM.isContainClass(pElement, pClass);
            if ( lRet )
                pElement.className += lSpaceChar + pClass;
            
            return lRet;
        };
        
        DOM.removeClass            = function(pElement, pClass) {
            var lClassName = pElement.className;
            
            if (lClassName.length > pClass.length)
                pElement.className = lClassName.replace(pClass, '');
        };
    }
    
    if (!window.JSON) {
        Util.json.parse       = $.parseJSON;
        
        /* https://gist.github.com/754454 */
        Util.json.stringify   = function(obj) {
            var n, v, has,
                ret     = '',
                value   = '',
                json    = [],
                isStr   = type.string(obj),
                isObj   = type.object(obj),
                isArray = type.array(obj);
            
            if (!isObj || obj === null) {
                // simple data type
                if (isStr)
                    obj = '"' + obj + '"';
                
                ret += obj;
            } else {
                // recurse array or object
                for (n in obj) {
                    v   = obj[n];
                    has = obj.hasOwnProperty(n);
                    
                    if (has) {
                        isStr   = type.string(v);
                        isObj   = type.object(v);
                        
                        if (isStr)
                            v   = '"' + v + '"';
                        else if (v && isObj)
                            v   = Util.json.stringify(v);
                        
                        if (!isArray)
                            value   = '"' + n + '":';
                        
                        json.push(value + v);
                    }
                }
                
                if (isArray)
                    ret = '[' + json + ']';
                else
                    ret = '{' + json + '}';
            }
            
            return ret;
        };
    }
    
})(window, document, Util, DOM, jQuery);
