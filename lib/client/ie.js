/* script, fixes ie */
var CloudCommander, $;

(function(){
    "use strict";
    
    /* setting head ie6 - ie8 */
    if(!document.head){
        document.head = document.getElementsByTagName("head")[0];
        
        /*
            {name: '', src: ' ',func: '', style: '', id: '', parent: '',
            async: false, inner: 'id{color:red, }, class:'', not_append: false}
        */
        lUtil.cssSet      = function(pParams_o){        
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
    
    var lUtil = CloudCommander.Util;
        
    /* setting function context (this) */
    lUtil.bind = function(pFunction, pContext){
        return $.proxy(pFunction, pContext);
    };
        
    if(!document.getElementsByClassName){
        lUtil.getByClass = function(pClass, pElement){
            var lClass = '.' + pClass;
            var lResult;
            
            if(pElement)
                lResult = $(pElement).find(lClass);
            else lResult = $.find(lClass);
            
            return lResult;
        };
    }
    
    
    lUtil.scrollIntoViewIfNeeded = function(el){
        /* 
         * http://www.performantdesign.com/2009/08/26/scrollintoview-but-only-if-out-of-view/
         */
        var topOfPage = window.pageYOffset          ||
            document.documentElement.scrollTop      ||
            document.body.scrollTop;
        
        var heightOfPage = window.innerHeight       ||
            document.documentElement.clientHeight   ||
            document.body.clientHeight;
        
        var elY = 0;
        var elH = 0;
        
        if (document.layers) { // NS4
            elY = el.y;
            elH = el.height;
        }
        else {
            for(var p = el; p && p.tagName != 'BODY'; p = p.offsetParent)
                elY += p.offsetTop;
            
            elH = el.offsetHeight;
        }
        
        if ((topOfPage + heightOfPage) < (elY + elH))
            el.scrollIntoView(false);
        
        else if (elY < topOfPage)
            el.scrollIntoView(true);
    };
    
})();