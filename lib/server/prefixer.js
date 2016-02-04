(function() {
    'use strict';
    
    module.exports = function(value) {
        if (typeof value === 'string')
            if (value && !~value.indexOf('/'))
                value = '/' + value;
            else if (value.length === 1)
                value = '';
        
        return value;
    }
})();
