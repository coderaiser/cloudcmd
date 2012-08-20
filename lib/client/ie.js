/* script, fixes ie */
var CloudCommander;

(function(){
    /* setting head ie6 - ie8 */
    document.head = document.getElementsByTagName("head")[0];
    
    document.getElementsByClassName = function(pClassName){
        return window.jQuery('.'+pClassName)[0];
    };
    
    var lUtil = CloudCommander.Util;
    
    lUtil.getByClass = function(pClass, pElement){
        var lClass = '.' + pClass;
        var lResult;
        
        if(pElement)
            lResult = pElement.find(lClass);
        else lResult = $.find(lClass);
        
        return lResult;
    };
    
    lUtil.cssSet =  function(pParams_o){
            var lElement = '<style ';
            
            if (pParams_o.id) lElement        += 'id='    + pParams_o.id    + ' ';        
            if (pParams_o.style) lElement     += 'style=' + pParams_o.style + ' ';        
            if (pParams_o.className) lElement += 'class=' + pParams_o.className;        
            if (pParams_o.inner)lElement      += '>' + pParams_o.inner;
            
            lElement +='</style>';
            return window.jQuery(lElement)
                .appendTo(pParams_o.parent || document.head);
                
        };
    /*
        {name: '', src: ' ',func: '', style: '', id: '', parent: '',
        async: false, inner: 'id{color:red, }, class:'', not_append: false}
    */
    this.cssSet      = function(pParams_o){        
        var lElement = '<style ';
        
        if (pParams_o.id) lElement        += 'id='    + pParams_o.id    + ' ';        
        if (pParams_o.style) lElement     += 'style=' + pParams_o.style + ' ';        
        if (pParams_o.className) lElement += 'class=' + pParams_o.className;        
        if (pParams_o.inner)lElement      += '>' + pParams_o.inner;
        
        lElement +='</style>';
        return $(lElement)
            .appendTo(pParams_o.parent || document.head);
            
    },
})();