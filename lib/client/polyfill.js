var Util, DOM, jQuery;

(function(Util, DOM, $){
    'use strict';
    
    if(!window.XMLHttpRequest || !document.head)
        DOM.ajax = $.ajax;
        
    /* setting head ie6 - ie8 */
    if(!document.head){
        document.head = $('head')[0];
        
        /*
            {name: '', src: ' ',func: '', style: '', id: '', parent: '',
            async: false, inner: 'id{color:red, }, class:'', not_append: false}
        */
        DOM.cssSet      = function(pParams_o){
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
        
    /* setting function context (this) */
    Util.bind = function(pFunction, pContext){
        var lRet;
        
        lRet = $.proxy(pFunction, pContext);
        
        return lRet;
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
        DOM.addListener = function(pType, pListener, pCapture, pElement){
            var lRet;
            
            if(!pElement)
                pElement = window;
            
            lRet = $(pElement).bind(pType, null, pListener);
            
            return lRet;
        };
    
    if(!document.removeEventListener){
        DOM.removeListener = function(pType, pListener, pCapture, pElement){
            var lRet;
            
            if(!pElement)
                pElement = window;
            
            $(pElement).unbind(pType, pListener);
            
            return lRet;
        };
    }
    
    if(!document.getElementsByClassName){
        DOM.getByClass = function(pClass, pElement){
            var lClass = '.' + pClass,
                lResult;
            
            if(pElement)
                lResult = $(pElement).find(lClass);
            else lResult = $.find(lClass);
            
            return lResult;
        };
    }
    
        DOM.scrollByPages           = Util.retFalse;
        /* function polyfill webkit standart function */
        DOM.scrollIntoViewIfNeeded = function(pElement, centerIfNeeded){
            if(!window.getComputedStyle)
                return;
            /*
                https://gist.github.com/2581101
            */
            centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;
            
            var parent = pElement.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = 
                    parseInt(parentComputedStyle.getPropertyValue('border-top-width'), 10),
                    
                parentBorderLeftWidth =
                    parseInt(parentComputedStyle.getPropertyValue('border-left-width'), 10),
                    
                overTop = pElement.offsetTop - parent.offsetTop < parent.scrollTop,
                overBottom = 
                    (pElement.offsetTop         - 
                        parent.offsetTop        + 
                        pElement.clientHeight   -
                        parentBorderTopWidth)   >
                    (parent.scrollTop + parent.clientHeight),
                    
                overLeft = pElement.offsetLeft - 
                    parent.offsetLeft < parent.scrollLeft,
                    
                overRight =
                    (pElement.offsetLeft        -
                        parent.offsetLeft       +
                        pElement.clientWidth    -
                        parentBorderLeftWidth)  >
                    (parent.scrollLeft + parent.clientWidth),
                
                alignWithTop = overTop && !overBottom;
            
            if ((overTop || overBottom) && centerIfNeeded)
                parent.scrollTop =
                    pElement.offsetTop      -
                    parent.offsetTop        -
                    parent.clientHeight / 2 -
                    parentBorderTopWidth    +
                    pElement.clientHeight / 2;
            
            if ((overLeft || overRight) && centerIfNeeded)
                parent.scrollLeft =
                    pElement.offsetLeft     -
                    parent.offsetLeft       -
                    parent.clientWidth / 2  -
                    parentBorderLeftWidth   +
                    pElement.clientWidth / 2;
            
            if ( (overTop || overBottom || overLeft || overRight) &&
                !centerIfNeeded)
                    pElement.scrollIntoView(alignWithTop);
          };
          
    if(!document.body.classList){
        
        DOM.isContainClass          = function(pElement, pClass){
            var lRet,
                lClassName  = pElement && pElement.className;
            
            if(lClassName)
                lRet = lClassName.indexOf(pClass) > 0;
                
            return lRet;
        };
        
        DOM.addClass = function(pElement, pClass){
            var lRet,
                lClassName  = pElement && pElement.className,
                lSpaceChar  = lClassName ? ' ' : '';
            
            lRet = !DOM.isContainClass(pElement, pClass);
            if( lRet )
                pElement.className += lSpaceChar + pClass;
            
            return lRet;
        };
        
        DOM.removeClass            = function(pElement, pClass){
            var lClassName = pElement.className;
            
            if(lClassName.length > pClass.length)
                pElement.className = lClassName.replace(pClass, '');
        };
    }
    
    if(!window.JSON){
        Util.parseJSON       = $.parseJSON;
        
        /* https://gist.github.com/754454 */
        Util.stringifyJSON   = function(pObj){
            var lRet;
            
            if (!Util.isObject(pObj) || pObj === null) {
                // simple data type
                if (Util.isString(pObj)) pObj = '"' + pObj + '"';
                lRet =  String(pObj);
            } else {
                // recurse array or object
                var n, v, json = [], isArray = Util.isArray(pObj);
                
                for (n in pObj) {
                    v = pObj[n];
                    
                    if (pObj.hasOwnProperty(n)) {
                        if (Util.isString(v))
                            v = '"' + v + '"';
                        else if (v && Util.isObject(v))
                            v = DOM.stringifyJSON(v);
                            
                        json.push((isArray ? "" : '"' + n + '":') + String(v));
                    }
                }
                lRet = (isArray ? "[" : "{") + String(json) + (isArray ? "]" : "}");
            }
            
            return lRet;
        };
    }
    
    if(!window.localStorage){
        var Storage                   = function(){
            /* приватный переключатель возможности работы с кэшем */
            var StorageAllowed,
                Data = {};
            
            /* функция проверяет возможно ли работать с кэшем каким-либо образом */
            this.isAllowed   = function(){
                return  StorageAllowed;
            };
            
            this.setAllowed = function(pAllowed){
                StorageAllowed = pAllowed;
                return pAllowed;
            };
            
            /** remove element */
            this.remove      = function(pItem){
                var lRet = this;
                if(StorageAllowed)
                    delete Data[pItem];
                
                return lRet;
            };
            
            /** если доступен localStorage и
             * в нём есть нужная нам директория -
             * записываем данные в него
             */
            this.set         = function(pName, pData){
                var lRet = this;
                
                if(StorageAllowed && pName && pData)
                    Data[pName] = pData;
                
                return lRet;
            },
            
            /** Если доступен Storage принимаем из него данные*/
            this.get        = function(pName){
                var lRet = false;
                
                if(StorageAllowed)
                    lRet = Data[pName];
                
                return lRet;
            },
            
            /* get all Storage from local storage */
            this.getAll     = function(){
                var lRet = null;
                
                if(StorageAllowed)
                    lRet = Data;
                
                return lRet;
            };
            
            /** функция чистит весь кэш для всех каталогов*/
            this.clear       = function(){
                var lRet = this;
                
                if(StorageAllowed)
                    Data = {};
                
                return lRet;
            };
        };
        
        DOM.Storage = new Storage();
    }
    
})(Util, DOM, jQuery);