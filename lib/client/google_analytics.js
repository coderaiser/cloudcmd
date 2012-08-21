var CloudCommander, _gaq;
(function(){
    /* setting google analitics tracking code */
    _gaq = [['_setAccount', 'UA-33536569-2'], ['_trackPageview']];
    
    window.onerror = function(msg, url, line) {
        var preventErrorAlert = true;
        _gaq.push(['_trackEvent',
            'JS Error',
            msg,
            navigator.userAgent + ' -> ' + url + " : " + line]);
        return preventErrorAlert;
    };
    
    CloudCommander.Util.jsload('http://google-analytics.com/ga.js');
})();