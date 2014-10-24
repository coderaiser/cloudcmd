var DOM, ga, GoogleAnalyticsObject;

(function(DOM) {
    'use strict';
    
    GoogleAnalyticsObject = 'ga';
    
    ga      = {
        l: new Date().getTime(),
        q: [['create', 'UA-33536569-2', 'auto'], ['send', 'pageview']]
    };
    
    DOM.Events.addError(function(msg, url, line) {
        ga.push(['_trackEvent', 'JS Error', msg,
            navigator.userAgent + ' -> ' + url + ' : ' + line]);
    });
    
    DOM.load.js('//www.google-analytics.com/analytics.js');

})(DOM);
