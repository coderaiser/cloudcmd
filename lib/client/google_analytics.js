var DOM, _gaq;
(function(DOM, _gaq){
    'use strict';
    
    /* setting google analitics tracking code */
    _gaq = [['_setAccount', 'UA-33536569-2'], ['_trackPageview']];
    
    DOM.addErrorListener(function(msg, url, line) {
        _gaq.push(['_trackEvent', 'JS Error', msg,
            navigator.userAgent + ' -> ' + url + " : " + line]);
    });
    
    DOM.jsload('//google-analytics.com/ga.js');

})(DOM, _gaq);