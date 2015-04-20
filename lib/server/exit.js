(function() {
    'use strict';
    
    module.exports = function() {
        console.error.apply(console, arguments);
        process.exit(1);
    };
})();
