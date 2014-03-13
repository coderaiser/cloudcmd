(function(){
    'use strict';
    
    var main        = global.cloudcmd.main,
        marked      = main.require('marked'),
        Util        = main.util;
    
    exports.parse = parse;
    
    function parse(data, callback) {
        var md;
        
        process.nextTick(function() {
            if (marked)
                md = marked(data);
            else
                md = '<pre>' + data + '</pre>';
        
            Util.exec(callback, null, md);
        });
    }
})();
