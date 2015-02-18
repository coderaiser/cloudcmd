(function(global) {
    'use strict';
    
    var PREFIX  = '/join';
    
    if (typeof module === 'object' && module.exports)
        module.exports  = join;
    else
        global.join     = join;
    
    function join(prefix, names) {
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
