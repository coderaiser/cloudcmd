var DOM, _gaq;

(function(DOM, _gaq) {
    'use strict';
    
    /* setting google analitics tracking code */
    _gaq = [['_setAccount', 'UA-33536569-2'], ['_trackPageview']];
    
    DOM.Events.addError(function(msg, url, line) {
        _gaq.push(['_trackEvent', 'JS Error', msg,
            navigator.userAgent + ' -> ' + url + ' : ' + line]);
    });
    
    DOM.load.js('//google-analytics.com/ga.js');

})(DOM, _gaq);
