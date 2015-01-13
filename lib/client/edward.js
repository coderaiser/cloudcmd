var join, Util, DOM;

(function(global, join, DOM, exec) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports = edward;
    else
        global.edward = edward;
    
    function edward(el, callback) {
        var Element = el || document.body;
        
        if (!(this instanceof edward))
            return new edward(Element, callback);
        
        init(callback);
        
        function init(callback) {
            loadFiles(callback);
        }
        
        function loadFiles(callback) {
            var css = '/css/edward.css',
                dir = '/modules/ace-builds/src-noconflict/',
                url = join([
                    'theme-tomorrow_night_blue',
                    'ext-language_tools',
                    'ext-searchbox',
                    'ext-modelist'
                ].map(function(name) {
                    return dir + name + '.js';
                }));
            
            DOM.loadRemote('ace', function() {
                DOM.load.parallel([url, css], function() {
                    exec(callback);
                });
            });
        }
    }
    
})(this, join, DOM, Util.exec);
