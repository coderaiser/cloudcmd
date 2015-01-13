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
            var dir = '/modules/ace-builds/src-noconflict/',
                url = join([
                    'theme-tomorrow_night_blue',
                    'ext-language_tools',
                    'ext-searchbox',
                    'ext-modelist'
                ].map(function(name) {
                    return dir + name + '.js';
                }));
            
            DOM.loadRemote('ace', function() {
                DOM.load.js(url, function() {
                    exec(callback);
                });
                
                DOM.load.style({
                    id      : 'msg-css',
                    inner   : '#js-view .msg {'     +
                                'z-index'           + ': 1;'                    +
                                'background-color'  + ': #7285B7;'              +
                                'color'             + ': #D1F1A9;'              +
                                'position'          + ': fixed;'                +
                                'left'              + ': 40%;'                  +
                                'top'               + ': 25px;'                 +
                                'padding'           + ': 5px;'                  +
                                'opacity'           + ': 0.9;'                  +
                                'transition'        + ': ease 0.5s;'            +
                            '}'
                });
            });
        }
    }
    
})(this, join, DOM, Util.exec);
