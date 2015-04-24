(function() {
    'use strict';
    
    module.exports = binom;
    
    function binom(name, array) {
        var ret;
            
             if (!Array.isArray(array))
                throw(Error('array should be array!'));
                
            if (typeof name !== 'string')
                throw(Error('name should be string!'));
            
            array.some(function(item) {
                var is      = item.name === name,
                    isArray = Array.isArray(item);
                
                if (is)
                    ret = item;
                else if (isArray)
                    item.some(function(item) {
                        is = item.name === name;
                        
                        if (is)
                            ret = item.data;
                        
                        return is;
                    });
                
                return is;
            });
            
            return ret;
        }
    
})();
