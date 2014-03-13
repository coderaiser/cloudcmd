(function(){
    'use strict';
    
    var main        = global.cloudcmd.main,
        DIR         = main.DIR,
        MD_DIR      = 'rest/markdown/',
        pipe        = main.pipe,
        parse       = main.srvrequire(MD_DIR + 'put').parse,
        Util        = main.util;
    
    exports.operate = operate;
    
    function operate(request, callback) {
        var method = request.method;
        
        
        switch(method) {
            case 'GET':
                break;
            
            case 'PUT':
                pipe.getBody(request, function(data) {
                    parse(data, callback);
                });
                break;
        }
    }
})();
