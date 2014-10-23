(function () {
    'use strict';
    
    var util        = require('util'),
        crypto      = require('crypto'),
        Writable    = require('stream').Writable;
    
    module.exports  = function() {
        var ret;
        
        if (Writable) {
            util.inherits(WS, Writable);
            ret = new WS();
        }
        
        return ret;
    };
    
    function WS(opt) {
        var sha         = crypto.createHash('sha1');
        
        Writable.call(this, opt);
        
        this._write     = function(chunk, enc, next) {
            sha.update(chunk);
            next();
        };
        
        this.get        = function() {
            var hex     = sha.digest('hex');
            
            return hex;
        };
    }
    
})();
