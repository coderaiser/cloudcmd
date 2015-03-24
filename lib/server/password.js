(function() {
    'use strict';
    
    var crypto = require('crypto');
    
    module.exports = function(algo, password) {
        var result, sha;
        
        if (!algo)
            algo = 'sha512WithRSAEncryption';
        
        sha = crypto.createHash(algo);
        
        sha.update(password);
        result = sha.digest('hex');
        
        return result;
    };
    
})();
