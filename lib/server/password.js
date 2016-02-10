(function() {
    'use strict';
    
    var crypto = require('crypto');
    
    module.exports = function(password, algo) {
        var result, sha;
        
        if (!password)
            throw Error('password could not be empty!');
        
        if (!algo)
            algo = 'sha512WithRSAEncryption';
        
        sha = crypto.createHash(algo);
        
        sha.update(password);
        result = sha.digest('hex');
        
        return result;
    };
    
})();
