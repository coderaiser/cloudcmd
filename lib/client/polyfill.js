var Util, DOM, jQuery;

(function(Util, DOM, $) {
    'use strict';
    
    if (!window.XMLHttpRequest || !document.head)
        DOM.ajax = $.ajax;
        
    /* setting head ie6 - ie8 */
    if (!document.head) {
        document.head = $('head')[0];
        
        /*
            {name: '', src: ' ',func: '', style: '', id: '', parent: '',
            async: false, inner: 'id{color:red, }, class:'', not_append: false}
        */
        DOM.cssSet      = function(pParams_o) {
            var lElement = '<style ';
            
            if (pParams_o.id) lElement        += 'id='      + pParams_o.id    + ' ';
            if (pParams_o.style) lElement     += 'style='   + pParams_o.style + ' ';
            if (pParams_o.className) lElement += 'class='   + pParams_o.className;
            if (pParams_o.inner)lElement      += '>'        + pParams_o.inner;
            
            lElement +='</style>';
            
            return $(lElement)
                .appendTo(pParams_o.parent || document.head);
        };
    }
    
    if (!Function.bind)
        Function.prototype.bind = function (context) {
            var aArgs   = Util.slice(arguments, 1), 
                fToBind = this, 
                NOP     = function () {},
                fBound  = function () {
                    var arr     = Util.slice(arguments),
                        args    = aArgs.concat(arr);
                    
                    return fToBind.apply(context, args);
                };
            
            NOP.prototype = this.prototype;
            fBound.prototype = new NOP();
        
            return fBound;
          };
    
    if (!Array.isArray)
        Array.isArray = function(arr) {
            var type    = Util.getType(arr),
                is      = type === 'array';
            
            return is;
        };
    
    /*
     * typeof callback === "function" should not be used,
     * as older browsers may report objects to be a function,
     * which they are not
     */
    Util.isFunction = $.isFunction;
    
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
    
    DOM.scrollByPages           = Util.retFalse;
    /* function polyfill webkit standart function
     *    https://gist.github.com/2581101
     */
    DOM.scrollIntoViewIfNeeded = function(pElement, centerIfNeeded) {
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
            
            parent                  = pElement.parentNode;
            parentComputedStyle     = window.getComputedStyle(parent, null);
            
            topWidth                = parentComputedStyle.getPropertyValue('border-top-width');
            leftWidth               = parentComputedStyle.getPropertyValue('border-left-width');
            
            parentBorderTopWidth    = parseInt(topWidth, 10);
            parentBorderLeftWidth   = parseInt(leftWidth, 10);
                
            overTop                 = pElement.offsetTop - parent.offsetTop < parent.scrollTop,
            overBottom              = 
                (pElement.offsetTop         - 
                    parent.offsetTop        + 
                    pElement.clientHeight   -
                    parentBorderTopWidth)   >
                (parent.scrollTop + parent.clientHeight),
                
            overLeft                = pElement.offsetLeft - 
                parent.offsetLeft < parent.scrollLeft,
                
            overRight               =
                (pElement.offsetLeft        -
                    parent.offsetLeft       +
                    pElement.clientWidth    -
                    parentBorderLeftWidth)  >
                (parent.scrollLeft + parent.clientWidth),
            
            alignWithTop            = overTop && !overBottom;
            
            if ((overTop || overBottom) && centerIfNeeded)
                parent.scrollTop    =
                    pElement.offsetTop      -
                    parent.offsetTop        -
                    parent.clientHeight / 2 -
                    parentBorderTopWidth    +
                    pElement.clientHeight / 2;
            
            if ((overLeft || overRight) && centerIfNeeded)
                parent.scrollLeft   =
                    pElement.offsetLeft     -
                    parent.offsetLeft       -
                    parent.clientWidth / 2  -
                    parentBorderLeftWidth   +
                    pElement.clientWidth / 2;
            
            if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded)
                pElement.scrollIntoView(alignWithTop);
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
        Util.parseJSON       = $.parseJSON;
        
        /* https://gist.github.com/754454 */
        Util.stringifyJSON   = function(obj) {
            var n, v, has,
                ret     = '',
                value   = '',
                json    = [],
                isStr   = Util.isString(obj),
                isObj   = Util.isObject(obj),
                isArray = Util.isArray(obj);
            
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
                        isStr   = Util.isString(v);
                        isObj   = Util.isObject(v);
                        
                        if (isStr)
                            v   = '"' + v + '"';
                        else if (v && isObj)
                            v   = Util.stringifyJSON(v);
                        
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
    
})(Util, DOM, jQuery);
