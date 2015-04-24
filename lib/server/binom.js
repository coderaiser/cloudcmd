(function() {
    'use strict';
    
    module.exports = binom;
    
    function binom(name, array) {
        var ret;
        
        if (typeof name !== 'string')
            throw(Error('name should be string!'));
        
        if (!Array.isArray(array))
            throw(Error('array should be array!'));
        
        array.some(function(item) {
            var is = item.name === name;
            
            if (is)
                ret = item;
            
            return is;
        });
        
        return ret;
    }
    
})();
