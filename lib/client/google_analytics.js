var CloudCommander, _gaq;
(function(){
    "use strict";
    
    /* setting google analitics tracking code */
    _gaq = [['_setAccount', 'UA-33536569-2'], ['_trackPageview']];
    
    var lOnError_f = window.onerror;
    window.onerror = function(msg, url, line) {
        var preventErrorAlert = true;
        _gaq.push(['_trackEvent',
            'JS Error',
            msg,
            navigator.userAgent + ' -> ' + url + " : " + line]);
            
        if(typeof lOnError_f === 'function')
            lOnError_f();
        
        return preventErrorAlert;
    };
    
    CloudCommander.Util.jsload('http://google-analytics.com/ga.js');
})();