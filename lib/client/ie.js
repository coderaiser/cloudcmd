/* script, fixes ie */
var Util, DOM, $;

(function(){
    "use strict";
    
    /* setting head ie6 - ie8 */
    if(!document.head){
        document.head = document.getElementsByTagName("head")[0];
        
        /*
            {name: '', src: ' ',func: '', style: '', id: '', parent: '',
            async: false, inner: 'id{color:red, }, class:'', not_append: false}
        */
        DOM.cssSet      = function(pParams_o){        
            var lElement = '<style ';
            
            if (pParams_o.id) lElement        += 'id='    + pParams_o.id    + ' ';
            if (pParams_o.style) lElement     += 'style=' + pParams_o.style + ' ';
            if (pParams_o.className) lElement += 'class=' + pParams_o.className;
            if (pParams_o.inner)lElement      += '>' + pParams_o.inner;
            
            lElement +='</style>';
            
            return $(lElement)
                .appendTo(pParams_o.parent || document.head);
        };
    }
        
    /* setting function context (this) */
    DOM.bind = function(pFunction, pContext){
        return $.proxy(pFunction, pContext);
    };
    
    if (!document.addEventListener)
        /**
         * safe add event listener on ie
         * @param pType
         * @param pListener
         */
        DOM.addListener = function(pType, pListener){
            var lType = 'on' + pType,
                lFunc = document[lType];
            
            document[lType] = function(){
                Util.exec(lFunc);
                pListener();
            };
        };
    
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
    
        /* function polyfill webkit standart function */
        DOM.scrollIntoViewIfNeeded = function(pElement, centerIfNeeded){
            /*
                https://gist.github.com/2581101
            */
            centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;
        
            var parent = pElement.parentNode,
                parentComputedStyle = window.getComputedStyle(parent, null),
                parentBorderTopWidth = 
                    parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
                    
                parentBorderLeftWidth =
                    parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
                    
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
        DOM.addClass = function(pElement, pClass){
            var lSpaceChar  = '',
                lClassName  = pElement.className,
                lRet_b      = true;
            
            if(lClassName) lSpaceChar = ' ';
            
            if( lClassName.indexOf(pClass) < 0 )
                pElement.className += lSpaceChar + pClass;
            else
                lRet_b = false;
        };
        
        DOM.removeClass            = function(pElement, pClass){
            var lClassName = pElement.className;
            
            if(lClassName.length > pClass.length)
                pElement.className = lClassName.replace(pClass, '');
        };
    }
    
    if(!window.XMLHttpRequest)
        DOM.ajax = $.ajax;
})();