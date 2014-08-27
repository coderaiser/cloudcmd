(function(scope) {
    'use strict';
    
    var Scope   = scope.window ? window : global,
        
        PREFIX  = '/join';
    
    if (typeof module === 'object' && module.exports)
        module.exports  = join;
    else
        Scope.join      = join;
    
    function join (prefix, names) {
        var url;
        
        if (!names) {
            names   = prefix;
            prefix  = PREFIX;
        }
        
        if (!names)
            throw(Error('names must be array!'));
        
        url = prefix + ':' + names.join(':');
        
        return url;
    }
    
})(this);
